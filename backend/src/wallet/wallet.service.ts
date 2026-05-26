import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Wallet, WalletDocument } from './schemas/wallet.schema';
import { Transaction, TransactionDocument, TransactionType, TransactionSource, TransactionStatus } from './schemas/transaction.schema';
import { SettingsService } from '../settings/settings.service';
import { ConfigService } from '@nestjs/config';
import { PaymentGateway, PaymentGatewayDocument } from '../settings/schemas/payment-gateway.schema';
import { PayoutMethod, PayoutMethodDocument } from './schemas/payout-method.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { User, UserDocument } from '../users/schemas/user.schema';
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
    private readonly notificationsService: NotificationsService,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
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
      // Check if already captured
      const existingTx = await this.transactionModel.findOne({ referenceId: orderId });
      if (existingTx) return { success: true, message: 'Already captured' };
      
      await this.addFunds(userId, amount, `PayPal Wallet Deposit`, TransactionSource.USER, orderId);
      return { success: true };
    } else {
      throw new Error('PayPal payment capture failed or is pending.');
    }
  }

  async captureStripeSession(userId: string, sessionId: string) {
    try {
      const stripe = await this.getStripeInstance();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      const fs = require('fs');
      fs.appendFileSync('stripe_debug.log', `[${new Date().toISOString()}] Retrieved Session: ${session.id} | Status: ${session.status} | Payment_Status: ${session.payment_status} | Metadata: ${JSON.stringify(session.metadata)}\n`);

      const isSuccess = session.payment_status === 'paid' || session.status === 'complete' || session.status === 'open';
      const isWalletDeposit = session.metadata?.type === 'wallet_deposit';

      if (isSuccess && isWalletDeposit) {
        const existingTx = await this.transactionModel.findOne({ referenceId: sessionId });
        if (existingTx) {
          return { success: true, message: 'Already captured' };
        }

        const amount = parseFloat(session.metadata?.amount || '0');
        if (isNaN(amount) || amount <= 0) {
          throw new BadRequestException('Invalid amount in Stripe session metadata.');
        }
        
        await this.addFunds(userId, amount, `Stripe Wallet Deposit`, TransactionSource.USER, sessionId);
        return { success: true };
      } else {
        throw new BadRequestException(`Stripe payment not completed or invalid. Status: ${session.payment_status}, Type: ${session.metadata?.type}`);
      }
    } catch (err: any) {
      const fs = require('fs');
      fs.appendFileSync('stripe_debug.log', `[${new Date().toISOString()}] Error in captureStripeSession: ${err.message}\n`);
      throw err;
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

    // Sync with User model
    const mongoose = require('mongoose');
    const userModel = mongoose.model('User');
    if (userModel) {
      await userModel.findByIdAndUpdate(userId, { walletBalance: wallet.balance });
    }

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

    // Sync with User model
    const mongoose = require('mongoose');
    const userModel = mongoose.model('User');
    if (userModel) {
      await userModel.findByIdAndUpdate(userId, { walletBalance: wallet.balance });
    }

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

  async addPendingFunds(userId: string, amount: number, description: string, referenceId: string) {
    const wallet = await this.getOrCreateWallet(userId);
    
    let transaction = await this.transactionModel.findOne({ referenceId, source: TransactionSource.BOOKING, type: TransactionType.CREDIT });
    if (!transaction) {
      transaction = await this.transactionModel.create({
        user: new Types.ObjectId(userId),
        wallet: wallet._id,
        amount: amount,
        type: TransactionType.CREDIT,
        status: TransactionStatus.PENDING,
        source: TransactionSource.BOOKING,
        description: description,
        referenceId: referenceId,
        currency: wallet.currency,
      });
    }
    return { transaction };
  }

  async finalizePendingFunds(userId: string, referenceId: string, finalAmount: number, description?: string) {
    let transaction = await this.transactionModel.findOne({ user: new Types.ObjectId(userId), referenceId, source: TransactionSource.BOOKING, type: TransactionType.CREDIT });
    if (transaction && transaction.status === TransactionStatus.PENDING) {
      const wallet = await this.walletModel.findById(transaction.wallet);
      transaction.status = TransactionStatus.SUCCESS;
      transaction.amount = finalAmount;
      if (description) transaction.description = description;
      await transaction.save();
      
      if (wallet) {
        wallet.balance += finalAmount;
        await wallet.save();
      }
      return transaction;
    }
    return null;
  }

  async cancelPendingFunds(referenceId: string, reason: string = 'Booking Cancelled') {
    // Find all pending transactions for this referenceId (should be Admin and Host)
    const transactions = await this.transactionModel.find({ 
      referenceId, 
      source: TransactionSource.BOOKING, 
      type: TransactionType.CREDIT,
      status: TransactionStatus.PENDING
    });
    
    for (const tx of transactions) {
      tx.status = TransactionStatus.FAILED;
      tx.description = `${tx.description} - ${reason}`;
      await tx.save();
    }
    return transactions.length;
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

    const pendingEarnings = transactions
      .filter(t => t.type === TransactionType.CREDIT && t.source === TransactionSource.BOOKING && t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      balance: wallet.balance,
      currency: wallet.currency,
      totalEarnings,
      pendingPayouts,
      pendingEarnings,
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

    // Notify all admins about the new withdrawal request
    try {
      const requester = await this.userModel.findById(userId).lean();
      const requesterName = requester ? `${(requester as any).firstName} ${(requester as any).lastName}` : 'A user';
      const admins = await this.userModel.find({ role: 'admin' }).lean();
      await Promise.all(admins.map(admin =>
        this.notificationsService.create(
          (admin as any)._id.toString(),
          'New Withdrawal Request',
          `${requesterName} has requested a withdrawal of ${amount} ${wallet.currency}.`,
          'withdrawal',
          { type: 'withdrawal_request', transactionId: transaction._id.toString(), url: '/admin/withdrawals' }
        )
      ));
    } catch (err) {
      console.error('[WalletService] Failed to notify admins of withdrawal request:', err);
    }

    return { transaction, newBalance: wallet.balance };
  }

  async getWithdrawalRequests() {
    return this.transactionModel
      .find({ type: TransactionType.DEBIT, source: TransactionSource.WITHDRAWAL })
      .populate({ path: 'user', select: 'firstName lastName email phoneNumber' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async approveWithdrawal(withdrawalId: string) {
    const transaction = await this.transactionModel.findById(withdrawalId);
    if (!transaction) throw new NotFoundException('Withdrawal request not found');
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new Error('Withdrawal request is not pending');
    }

    transaction.status = TransactionStatus.SUCCESS;
    await transaction.save();

    return transaction;
  }

  async rejectWithdrawal(withdrawalId: string, reason: string) {
    const transaction = await this.transactionModel.findById(withdrawalId);
    if (!transaction) throw new NotFoundException('Withdrawal request not found');
    if (transaction.status !== TransactionStatus.PENDING) {
      throw new Error('Withdrawal request is not pending');
    }

    transaction.status = TransactionStatus.FAILED;
    transaction.description = transaction.description ? `${transaction.description} - Rejected: ${reason}` : `Rejected: ${reason}`;
    await transaction.save();

    const wallet = await this.walletModel.findById(transaction.wallet);
    if (wallet) {
      wallet.balance += transaction.amount;
      await wallet.save();
      
      await this.transactionModel.create({
        user: transaction.user,
        wallet: wallet._id,
        amount: transaction.amount,
        type: TransactionType.CREDIT,
        status: TransactionStatus.SUCCESS,
        source: TransactionSource.REFUND,
        description: `Refund for rejected withdrawal: ${reason}`,
        currency: wallet.currency,
      });
    }

    return transaction;
  }
}
