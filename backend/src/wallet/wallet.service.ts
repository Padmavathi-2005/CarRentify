import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionSource, TransactionStatus } from './schemas/transaction.schema';
import { SettingsService } from '../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway, PaymentGatewayDocument } from '../settings/schemas/payment-gateway.schema';
import { PayoutMethod, PayoutMethodDocument } from './schemas/payout-method.schema';
import Stripe from 'stripe';

@Injectable()
export class WalletService {
  constructor(
    @InjectModel(Wallet.name) private walletModel: Model<WalletDocument>,
    @InjectModel(Transaction.name) private transactionModel: Model<TransactionDocument>,
    private settingsService: SettingsService,
    private readonly configService: ConfigService,
    @InjectModel(PaymentGateway.name) private gatewayModel: Model<PaymentGatewayDocument>,
    @InjectModel(PayoutMethod.name) private payoutModel: Model<PayoutMethodDocument>,
  ) {}

  async getPayoutMethod(userId: string) {
    return this.payoutModel.findOne({ user: new Types.ObjectId(userId) });
  }

  async savePayoutMethod(userId: string, data: any) {
    return this.payoutModel.findOneAndUpdate(
      { user: new Types.ObjectId(userId) },
      { ...data, user: new Types.ObjectId(userId) },
      { upsert: true, new: true }
    );
  }

  private async getPayPalAccessToken(gateway: any) {
    const auth = Buffer.from(`${gateway.clientId}:${gateway.clientSecret}`).toString('base64');
    const baseUrl = gateway.isTestMode ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com';
    
    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return { token: data.access_token, baseUrl };
  }

  private async getStripeInstance() {
    const gateway = await this.gatewayModel.findOne({ slug: 'stripe', isEnabled: true });
    if (!gateway || !gateway.clientSecret) {
      throw new Error('Stripe is not configured or disabled by admin.');
    }
    return new Stripe(gateway.clientSecret, {
      apiVersion: '2025-01-27.acacia' as any,
    });
  }

  async createCheckoutSession(userId: string, amount: number, method: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const settings = await this.settingsService.getSettings();
    
    const frontUrlEnv = this.configService.get<string>('FRONTEND_URL');
    let siteUrl = frontUrlEnv || settings?.general?.siteUrl || 'http://localhost:3000';
    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1);

    if (method === 'stripe') {
      const stripe = await this.getStripeInstance();
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: wallet.currency.toLowerCase(),
            product_data: {
              name: 'Wallet Deposit',
              description: `Adding funds to your digital wallet`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${siteUrl}/dashboard/wallet?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/dashboard/wallet?canceled=true`,
        metadata: {
          userId: userId,
          type: 'wallet_deposit',
          amount: amount.toString()
        },
      });
      return { url: session.url };
    }

    if (method === 'paypal') {
      try {
        const gateway = await this.gatewayModel.findOne({ slug: 'paypal', isEnabled: true });
        if (!gateway) throw new Error('PayPal is not configured or disabled by admin.');

        const { token, baseUrl } = await this.getPayPalAccessToken(gateway);
        
        const orderRes = await fetch(`${baseUrl}/v2/checkout/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [{
              amount: {
                currency_code: (wallet.currency || 'USD').toUpperCase(),
                value: amount.toFixed(2),
              },
              description: `Wallet Deposit: Adding funds to your digital wallet`,
            }],
            application_context: {
              return_url: `${siteUrl}/dashboard/wallet?success=true&gateway=paypal&amount=${amount}`,
              cancel_url: `${siteUrl}/dashboard/wallet?canceled=true`,
            }
          }),
        });

        const orderData = await orderRes.json();
        const approveUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
        
        if (!approveUrl) throw new Error('PayPal did not return an approval URL');
        
        return { url: approveUrl };
      } catch (error) {
        throw new Error('PayPal initialization failed: ' + error.message);
      }
    }

    throw new Error('Unsupported payment method for wallet deposit');
  }

  async capturePayPalOrder(userId: string, orderId: string) {
    const gateway = await this.gatewayModel.findOne({ slug: 'paypal', isEnabled: true });
    if (!gateway) throw new Error('PayPal is not configured or disabled by admin.');

    const { token, baseUrl } = await this.getPayPalAccessToken(gateway);
    
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const captureData = await captureRes.json();
    
    if (captureData.status === 'COMPLETED') {
      const amount = parseFloat(captureData.purchase_units[0].payments.captures[0].amount.value);
      await this.addFunds(userId, amount, `PayPal Wallet Deposit: ${orderId}`, TransactionSource.USER, orderId);
      return { success: true };
    } else {
      throw new Error('PayPal payment capture failed or is pending.');
    }
  }

  async getOrCreateWallet(userId: string): Promise<WalletDocument> {
    let wallet = await this.walletModel.findOne({ user: new Types.ObjectId(userId) });
    if (!wallet) {
      const settings = await this.settingsService.getSettings();
      const defaultCurrency = settings?.general?.defaultCurrency || 'USD';
      
      wallet = await this.walletModel.create({
        user: new Types.ObjectId(userId),
        balance: 0,
        currency: defaultCurrency,
      });
    }
    return wallet;
  }

  async getWalletBalance(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return {
      balance: wallet.balance,
      currency: wallet.currency,
    };
  }

  async getTransactions(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    return this.transactionModel
      .find({ wallet: wallet._id })
      .sort({ createdAt: -1 })
      .exec();
  }

  async addFunds(userId: string, amount: number, description: string, source: TransactionSource = TransactionSource.USER, referenceId?: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    const transaction = await this.transactionModel.create({
      user: new Types.ObjectId(userId),
      wallet: wallet._id,
      amount: amount,
      type: TransactionType.CREDIT,
      status: TransactionStatus.SUCCESS,
      source: source,
      description: description,
      referenceId: referenceId,
      currency: wallet.currency,
    });

    wallet.balance += amount;
    await wallet.save();

    return { transaction, newBalance: wallet.balance };
  }

  async deductFunds(userId: string, amount: number, description: string, source: TransactionSource = TransactionSource.BOOKING, referenceId?: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient funds');
    }

    const transaction = await this.transactionModel.create({
      user: new Types.ObjectId(userId),
      wallet: wallet._id,
      amount: amount,
      type: TransactionType.DEBIT,
      status: TransactionStatus.SUCCESS,
      source: source,
      description: description,
      referenceId: referenceId,
      currency: wallet.currency,
    });

    wallet.balance -= amount;
    await wallet.save();

    return { transaction, newBalance: wallet.balance };
  }

  // Admin specifically adding/removing funds
  async adminUpdateBalance(userId: string, amount: number, description: string, type: TransactionType) {
    if (type === TransactionType.CREDIT) {
      return this.addFunds(userId, amount, description, TransactionSource.ADMIN);
    } else {
      return this.deductFunds(userId, amount, description, TransactionSource.ADMIN);
    }
  }

  async getWalletStats(userId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    const transactions = await this.transactionModel.find({ wallet: wallet._id });

    const totalEarnings = transactions
      .filter(t => t.type === TransactionType.CREDIT && t.source === TransactionSource.BOOKING && t.status === TransactionStatus.SUCCESS)
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingPayouts = transactions
      .filter(t => t.type === TransactionType.DEBIT && t.source === TransactionSource.WITHDRAWAL && t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: wallet.balance,
      currency: wallet.currency,
      totalEarnings,
      pendingPayouts,
    };
  }

  async requestWithdrawal(userId: string, amount: number, description: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    if (wallet.balance < amount) {
      throw new Error('Insufficient funds for withdrawal');
    }

    const transaction = await this.transactionModel.create({
      user: new Types.ObjectId(userId),
      wallet: wallet._id,
      amount: amount,
      type: TransactionType.DEBIT,
      status: TransactionStatus.PENDING,
      source: TransactionSource.WITHDRAWAL,
      description: description || 'Withdrawal request',
      currency: wallet.currency,
    });

    wallet.balance -= amount;
    await wallet.save();

    return { transaction, newBalance: wallet.balance };
  }
}
