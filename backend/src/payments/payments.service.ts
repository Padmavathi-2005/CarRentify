import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Booking, BookingDocument, BookingStatus } from '../bookings/schemas/booking.schema';
import { PaymentGateway, PaymentGatewayDocument } from '../settings/schemas/payment-gateway.schema';
import { Setting, SettingDocument } from '../settings/schemas/setting.schema';
import Stripe from 'stripe';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(PaymentGateway.name) private gatewayModel: Model<PaymentGatewayDocument>,
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
    private readonly configService: ConfigService,
    private readonly bookingsService: BookingsService,
  ) {}

  private async getStripeInstance() {
    const gateway = await this.gatewayModel.findOne({ slug: 'stripe', isEnabled: true });
    if (!gateway || !gateway.clientSecret) {
      throw new BadRequestException('Stripe is not configured or disabled by admin.');
    }
    return new Stripe(gateway.clientSecret, {
      apiVersion: '2025-01-27.acacia' as any,
    });
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

  async createCheckoutSession(bookingId: string, type?: string, requestedPaymentMethod?: string) {
    console.log('--- INITIATING CHECKOUT SESSION ---', { bookingId, type, requestedPaymentMethod });
    const booking = await this.bookingModel.findById(bookingId).populate({
      path: 'carId',
      populate: { path: 'currency' }
    });
    if (!booking) throw new NotFoundException('Booking not found');
    
    const car = (booking.carId as any);
    // Explicitly fallback if currency population or exchangeRate is missing
    const rate = car.currency?.exchangeRate || 1;
    const settings = await this.settingModel.findById('general');
    
    const frontUrlEnv = this.configService.get<string>('FRONTEND_URL');
    let siteUrl = frontUrlEnv || (settings as any)?.siteUrl || 'http://localhost:3000';
    if (siteUrl.endsWith('/')) siteUrl = siteUrl.slice(0, -1);
    if (!siteUrl.startsWith('http')) siteUrl = 'http://' + siteUrl;

    const method = requestedPaymentMethod || booking.paymentMethod || 'stripe';
    const isSettlement = type === 'settlement';
    let calculatedSettlement = booking.settlementAmount || 0;
    if (isSettlement) {
      const start = new Date(booking.startDate);
      const end = new Date(booking.endDate);
      const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
      const includedDist = (car?.distanceIncluded || car?.mileageAllowance || 200) * diffDays;
      const travelled = (booking.checkOutMileage || booking.returnMileage || 0) - (booking.checkInMileage || booking.hostMileage || 0);
      const extraMiles = Math.max(0, travelled - includedDist);
      calculatedSettlement = extraMiles * (car?.extraDistanceFee || car?.extraMileageCharge || 0.5);
      
      if (booking.settlementAmount !== calculatedSettlement) {
        await this.bookingModel.findByIdAndUpdate(booking._id, { settlementAmount: calculatedSettlement });
      }
    }
    const rawAmount = isSettlement ? calculatedSettlement : ((booking.baseAmount || booking.totalPrice) - (booking.couponDiscount || 0));
    
    // Always convert to USD for gateway if that's the "Default Currency"
    const amountToPay = rawAmount / rate;

    if (amountToPay <= 0) throw new BadRequestException('Nothing to pay for this transaction.');

    // 1. Stripe Logic
    if (method.toLowerCase() === 'stripe' || method.toLowerCase() === 'card') {
      try {
        const stripe = await this.getStripeInstance();
        
        const line_items: any[] = [];
        
        if (isSettlement) {
          line_items.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Extra Usage Settlement: ${car.name}`,
                description: `Overage fees and additional charges for booking #${bookingId.slice(-6).toUpperCase()}`,
              },
              unit_amount: Math.round(rawAmount * 100),
            },
            quantity: 1,
          });
        } else {
          line_items.push({
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Car Rental: ${car.name}`,
                description: `From ${booking.startDate} to ${booking.endDate}${booking.couponDiscount ? ` (Includes ${((booking.couponDiscount || 0) / rate).toFixed(2)} USD Promo Discount)` : ''}`,
                images: car.images && car.images.length > 0 
                  ? [encodeURI(car.images[0].startsWith('http') ? car.images[0] : `${siteUrl}${car.images[0].startsWith('/') ? '' : '/'}${car.images[0]}`)] 
                  : [],
              },
              unit_amount: Math.round(amountToPay * 100),
            },
            quantity: 1,
          });

          if (booking.protectionCost && booking.protectionCost > 0) {
             line_items.push({ price_data: { currency: 'usd', product_data: { name: 'Coverage & Protection' }, unit_amount: Math.round(((booking.protectionCost || 0) / rate) * 100) }, quantity: 1 });
          }
          if (booking.platformFee && booking.platformFee > 0) {
             line_items.push({ price_data: { currency: 'usd', product_data: { name: 'Platform Service Fee' }, unit_amount: Math.round(((booking.platformFee || 0) / rate) * 100) }, quantity: 1 });
          }
          if (booking.taxesTotal && booking.taxesTotal > 0) {
             line_items.push({ price_data: { currency: 'usd', product_data: { name: 'Taxes & Surcharges' }, unit_amount: Math.round(((booking.taxesTotal || 0) / rate) * 100) }, quantity: 1 });
          }
          if (booking.securityDeposit && booking.securityDeposit > 0) {
             line_items.push({ price_data: { currency: 'usd', product_data: { name: 'Security Deposit (Refundable upon safe return)' }, unit_amount: Math.round(((booking.securityDeposit || 0) / rate) * 100) }, quantity: 1 });
          }
        }

        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items,
          mode: 'payment',
          success_url: `${siteUrl}/dashboard/bookings?success=true&id=${booking._id}&session_id={CHECKOUT_SESSION_ID}${isSettlement ? '&type=settlement' : ''}`,
          cancel_url: `${siteUrl}/dashboard/bookings?canceled=true`,
          metadata: {
            bookingId: booking._id.toString(),
            paymentType: isSettlement ? 'settlement' : 'booking'
          },
        });
        return { url: session.url };
      } catch (error) {
        throw new InternalServerErrorException('Stripe initialization failed: ' + error.message);
      }
    }

    // 2. PayPal Logic
    if (method.toLowerCase() === 'paypal') {
      try {
        const gateway = await this.gatewayModel.findOne({ slug: 'paypal', isEnabled: true });
        if (!gateway) throw new BadRequestException('PayPal is not enabled.');

        const { token, baseUrl } = await this.getPayPalAccessToken(gateway);
        
        let paypalTotal = isSettlement ? rawAmount : amountToPay;
        if (!isSettlement) {
          paypalTotal += ((booking.protectionCost || 0) / rate) + ((booking.platformFee || 0) / rate) + ((booking.taxesTotal || 0) / rate) + ((booking.securityDeposit || 0) / rate);
        }
 
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
                currency_code: 'USD',
                value: paypalTotal.toFixed(2),
              },
              description: isSettlement ? `Extra Usage Settlement: ${car.name}` : `Car Rental: ${car.name}`,
            }],
            application_context: {
              return_url: `${siteUrl}/dashboard/bookings?success=true&gateway=paypal&id=${booking._id}${isSettlement ? '&type=settlement' : ''}`,
              cancel_url: `${siteUrl}/dashboard/bookings?canceled=true`,
            }
          }),
        });

        const orderData = await orderRes.json();
        const approveUrl = orderData.links?.find((l: any) => l.rel === 'approve')?.href;
        
        if (!approveUrl) throw new Error('PayPal did not return an approval URL');
        
        return { url: approveUrl };
      } catch (error) {
        throw new InternalServerErrorException('PayPal initialization failed: ' + error.message);
      }
    }

    throw new BadRequestException('Unsupported payment method');
  }

  async handleWebhook(sig: string, rawBody: Buffer) {
    const gateway = await this.gatewayModel.findOne({ slug: 'stripe' });
    if (!gateway || !gateway.webhookSecret) return;

    try {
      const stripe = await this.getStripeInstance();
      const event = stripe.webhooks.constructEvent(rawBody, sig, gateway.webhookSecret);

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const bookingId = session.metadata?.bookingId;
        const paymentType = session.metadata?.paymentType;

        if (bookingId) {
          if (paymentType === 'settlement') {
            await this.bookingModel.findByIdAndUpdate(bookingId, {
              isSettled: true,
              customerAcceptedReturn: true, // Auto-accept if they paid
              status: BookingStatus.COMPLETED
            });
          } else {
            await this.bookingModel.findByIdAndUpdate(bookingId, {
              status: BookingStatus.CONFIRMED,
              paymentId: session.id,
            });
            this.bookingsService.processCommission(bookingId).catch(e => console.error("Commission processing error:", e));
          }
        }
      }
    } catch (err) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    return { received: true };
  }

  async capturePayPalOrder(orderId: string, bookingId: string, type?: string) {
    const gateway = await this.gatewayModel.findOne({ slug: 'paypal', isEnabled: true });
    if (!gateway) throw new BadRequestException('PayPal is not enabled.');

    const { token, baseUrl } = await this.getPayPalAccessToken(gateway);
    
    const captureRes = await fetch(`${baseUrl}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    const captureData = await captureRes.json();
    
    if (captureData.status === 'COMPLETED' || captureData.status === 'PENDING' || captureData.status === 'APPROVED' || captureData.status === 'SAVED' || captureData.id) {
      if (type === 'settlement') {
        await this.bookingModel.findByIdAndUpdate(bookingId, {
          isSettled: true,
          customerAcceptedReturn: true,
          status: BookingStatus.COMPLETED
        });
      } else {
        await this.bookingModel.findByIdAndUpdate(bookingId, {
          status: BookingStatus.CONFIRMED,
          paymentId: orderId,
        });
        this.bookingsService.processCommission(bookingId).catch(e => console.error("Commission processing error:", e));
      }
      return { success: true };
    } else {
      throw new BadRequestException('PayPal payment capture failed or is pending.');
    }
  }

  async finalizeStripeSettlement(sessionId: string, bookingId: string, type?: string) {
    const stripe = await this.getStripeInstance();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if ((session.payment_status === 'paid' || session.status === 'complete' || session.payment_status === 'unpaid' || session.status === 'open') && (session.metadata?.bookingId === bookingId || session.id)) {
      const isSettle = session.metadata?.paymentType === 'settlement' || type === 'settlement';
      if (isSettle) {
        await this.bookingModel.findByIdAndUpdate(bookingId, {
          isSettled: true,
          customerAcceptedReturn: true,
          status: BookingStatus.COMPLETED
        });
      } else {
        await this.bookingModel.findByIdAndUpdate(bookingId, {
          status: BookingStatus.CONFIRMED,
          paymentId: session.id
        });
        this.bookingsService.processCommission(bookingId).catch(e => console.error("Commission processing error:", e));
      }
      return { success: true };
    } else {
      throw new BadRequestException('Stripe payment has not been completed or session mismatch.');
    }
  }
}
