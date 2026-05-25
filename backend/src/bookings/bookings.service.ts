import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Booking,
  BookingDocument,
  BookingStatus,
} from './schemas/booking.schema';
import { Car, CarDocument } from '../cars/schemas/car.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { Cron, CronExpression } from '@nestjs/schedule';

import { Setting, SettingDocument } from '../settings/schemas/setting.schema';
import { Verification, VerificationDocument } from '../verification/schemas/verification.schema';
import * as nodemailer from 'nodemailer';
import { WalletService } from '../wallet/wallet.service';
import { TransactionSource } from '../wallet/schemas/transaction.schema';

@Injectable()
export class BookingsService {
  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    @InjectModel(Car.name) private carModel: Model<CarDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
    @InjectModel('Report') private reportModel: Model<any>,
    @InjectModel(Verification.name) private verificationModel: Model<VerificationDocument>,
    private readonly walletService: WalletService,
  ) {}

  private async sendCommunication(user: any, title: string, message: string, type: string, data?: any) {
    if (!user) return;
    try {
      // 1. In-app notification
      await this.notificationsService.create(user._id.toString(), title, message, type, data);

      // 2. Email
      const settings = await this.settingModel.findById('smtp');
      if (settings && (settings as any).smtpHost && (settings as any).smtpUser) {
        const transporter = nodemailer.createTransport({
          host: (settings as any).smtpHost,
          port: parseInt((settings as any).smtpPort) || 587,
          secure: parseInt((settings as any).smtpPort) === 465,
          auth: {
            user: (settings as any).smtpUser,
            pass: (settings as any).smtpPassword,
          },
        });
        await transporter.sendMail({
          from: (settings as any).smtpFrom || '"CarRental System" <noreply@carrental.com>',
          to: user.email,
          subject: title,
          text: message,
        });
      }

      // 3. SMS (Mock)
      if (user.phoneNumber) {
        console.log(`[SMS MOCK] Sending SMS to ${user.phoneNumber}: ${title}`);
      }
    } catch (err) {
      console.error(`Communication failure for user ${user._id}:`, err?.message || err);
      // Suppress errors to prevent request crashes
    }
  }

  async processCommission(bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking || booking.isCommissionProcessed) return;

    // Get commission rate from settings
    const financeSettings = await this.settingModel.findById('financials');
    const rate = financeSettings ? (financeSettings as any).commissionRate : 15;

    // Prefer the exact stored platform fee if available (prevents double-commission).
    // Fallback computes from baseAmount, else from totalPrice as last resort.
    const commissionAmount =
      (booking as any).platformFee ??
      (((booking as any).baseAmount ?? booking.totalPrice) * rate) / 100;

    // Find Admin User
    const admin = await this.userModel.findOne({ email: 'admin@gmail.com' });
    if (admin) {
      await this.userModel.findByIdAndUpdate(admin._id, {
        $inc: { walletBalance: commissionAmount }
      });
      
      // Update Admin's digital wallet and create transaction history
      await this.walletService.addFunds(
        admin._id.toString(),
        commissionAmount,
        `Commission collected from Booking #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}`,
        TransactionSource.BOOKING,
        booking._id.toString()
      );
      
      booking.isCommissionProcessed = true;
      await booking.save();
      console.log(`[Commission] $${commissionAmount} credited to Admin for Booking ${bookingId}`);
    }
  }

  async create(bookingData: any, customerId: string): Promise<Booking> {
    const car = await this.carModel.findById(bookingData.carId);
    if (!car) throw new NotFoundException('Car not found');

    const isOnlineMethod = ['stripe', 'paypal'].includes((bookingData.paymentMethod || '').toLowerCase());

    const status =
      car.bookingType === 'Instant'
        ? (isOnlineMethod ? BookingStatus.AWAITING_PAYMENT : BookingStatus.CONFIRMED)
        : BookingStatus.PENDING;

    // License Expiry Check
    const customerUser = await this.userModel.findById(customerId);
    if (!customerUser) throw new NotFoundException('Customer not found');

    const bookingEndDate = new Date(`${bookingData.endDate}T${bookingData.returnTime || '00:00'}`);
    if (!customerUser.licenseExpiryDate || customerUser.licenseExpiryDate.getTime() < bookingEndDate.getTime()) {
      throw new BadRequestException('Your license is missing, expired, or will expire before your trip ends. Please update your license in your profile.');
    }

    // 1. Strict Duplicate Check: Prevent the same user from double-booking the same asset for the same period
    const duplicateBooking = await this.bookingModel.findOne({
      customerId: new Types.ObjectId(customerId),
      carId: bookingData.carId,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.AWAITING_PAYMENT, BookingStatus.ACTIVE] }
    });
    if (duplicateBooking) {
      throw new BadRequestException('You already have an active booking request for this period.');
    }

    // Temporal Protection: Prevent identical bookings within 10 seconds (Race Condition Mitigation)
    const recentBooking = await this.bookingModel.findOne({
      customerId: new Types.ObjectId(customerId),
      carId: bookingData.carId,
      createdAt: { $gt: new Date(Date.now() - 10000) }
    });
    if (recentBooking) {
      throw new BadRequestException('A booking request was recently processed. Please wait a moment before trying again.');
    }

    // 2. Global Availability Check: Validate Temporal Overlap with 1-hour buffer
    const reqStart = new Date(`${bookingData.startDate}T${bookingData.pickupTime || '00:00'}`);
    const reqEnd = new Date(`${bookingData.endDate}T${bookingData.returnTime || '00:00'}`);
    
    // Ensure precision by zeroing out seconds and milliseconds
    reqStart.setSeconds(0, 0);
    reqEnd.setSeconds(0, 0);

    const existingBookings = await this.bookingModel.find({
      carId: bookingData.carId,
      status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.AWAITING_PAYMENT, BookingStatus.ACTIVE] }
    });

    for (const eb of existingBookings) {
      const ebStart = new Date(`${eb.startDate}T${eb.pickupTime || '00:00'}`);
      const ebEnd = new Date(`${eb.endDate}T${eb.returnTime || '00:00'}`);
      
      ebStart.setSeconds(0, 0);
      ebEnd.setSeconds(0, 0);

      // A conflict exists if (NewRange) overlaps with (ExistingRange + 1hr buffer at end)
      // Buffer of 1 hour (3600000ms) is applied to prevent back-to-back handovers
      const bufferMs = 60 * 60 * 1000;
      const isOverlapping = (reqStart.getTime() < ebEnd.getTime() + bufferMs) && 
                           (reqEnd.getTime() + bufferMs > ebStart.getTime());

      if (isOverlapping) {
        throw new BadRequestException(
          'This vehicle is already reserved for the selected period (including a mandatory 1-hour safety buffer between bookings).',
        );
      }
    }

    // Directly use the final computed totalPrice from the frontend to avoid double-charging.
    const finalTotal = Number(bookingData.totalPrice || 0);
    // Use the explicit breakdown sent from the frontend to maintain transparency
    const bd = bookingData.breakdown || {};
    const baseAmount = bd.subtotal || finalTotal; 
    const platformFee = bd.platformFee || 0;
    const taxesTotal = bd.taxesTotal || 0;
    const securityDeposit = bd.securityDeposit || 0;
    const protectionCost = bd.protectionCost || 0;
    const couponDiscount = bd.couponDiscount || 0;

    // Get commission rate from settings
    const financeSettings = await this.settingModel.findById('financials');
    const commissionRate = financeSettings ? (financeSettings as any).commissionRate : 15;

    const newBooking = new this.bookingModel({
      ...bookingData,
      carId: new Types.ObjectId(bookingData.carId),
      customerId: new Types.ObjectId(customerId),
      vendorId: car.vendor,
      bookingType: car.bookingType,
      status,
      baseAmount,
      platformFee,
      taxesTotal,
      protectionCost,
      couponDiscount,
      commissionRateApplied: commissionRate,
      securityDeposit,
      totalPrice: finalTotal,
      couponId: bookingData.couponId,
      bookingHash: `BK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
    });

    const savedBooking = await newBooking.save();

    if (savedBooking.status === BookingStatus.CONFIRMED) {
      // commission calc can be async too
      this.processCommission(savedBooking._id.toString()).catch(e => console.error("Commission processing error:", e));
    }

    // --- ASYNC COMMUNICATIONS (Non-blocking) ---
    const runAsyncComms = async () => {
      try {
        const customer = await this.userModel.findById(customerId);
        const customerName = customer ? `${customer.firstName} ${customer.lastName}` : 'A customer';
        const vendorUser = await this.userModel.findById(car.vendor);

        // Notify Vendor
        await this.sendCommunication(
          vendorUser,
          car.bookingType === 'Instant' ? `Instant Booking: ${car.name}` : `New Request: ${car.name}`,
          `Vehicle: ${car.name}\nCustomer: ${customerName}\nDates: ${bookingData.startDate} to ${bookingData.endDate}\nTotal: $${finalTotal.toFixed(2)}${bookingData.message ? `\nMessage: ${bookingData.message}` : ''}`,
          car.bookingType === 'Instant' ? 'success' : 'info',
          { type: 'booking', bookingId: savedBooking._id.toString(), userType: 'host' }
        );

        // Notify Customer
        await this.sendCommunication(
          customer,
          `Booking Placed: ${car.name}`,
          `Your booking request for ${car.name} has been placed successfully.`,
          'info',
          { type: 'booking', bookingId: savedBooking._id.toString(), userType: 'renter' }
        );

        // Notify Admins
        const admins = await this.userModel.find({ role: 'admin' });
        for (const adminUser of admins) {
          await this.sendCommunication(
            adminUser,
            'New Platform Booking',
            `Vehicle: ${car.name}\nVendor: ${car.vendor}\nCustomer: ${customerName}\nTotal: $${finalTotal.toFixed(2)}`,
            'info',
            { type: 'booking', bookingId: savedBooking._id.toString() }
          );
        }
      } catch (err) {
        console.error("Critical error in background communications:", err);
      }
    };

    runAsyncComms(); // Trigger background tasks without awaiting

    return savedBooking;
  }

  async approve(bookingId: string, vendorId: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId.toString() !== vendorId)
      throw new BadRequestException('Unauthorized');
    if (booking.status !== BookingStatus.PENDING)
      throw new BadRequestException('Booking is not pending');

    const isOnlineMethod = ['stripe', 'paypal'].includes((booking.paymentMethod || '').toLowerCase());
    booking.status = isOnlineMethod ? BookingStatus.AWAITING_PAYMENT : BookingStatus.CONFIRMED;
    await booking.save();

    if (booking.status === BookingStatus.CONFIRMED) {
      await this.processCommission(bookingId);
    }

    const customerUser = await this.userModel.findById(booking.customerId);
    const vendorUser = await this.userModel.findById(booking.vendorId);

    // Persistent Notification to Customer
    await this.sendCommunication(
      customerUser,
      isOnlineMethod ? `Payment Required: ${(booking.carId as any).name}` : `Approved: ${(booking.carId as any).name}`,
      isOnlineMethod
        ? `Your request for ${(booking.carId as any).name} has been approved! Please click here to complete your payment.`
        : `Great news! Your booking for ${(booking.carId as any).name} has been approved by the host.`,
      isOnlineMethod ? 'info' : 'success',
      { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' }
    );
    // Persistent Notification to Vendor
    await this.sendCommunication(
      vendorUser,
      'Booking Approved',
      `You approved the booking for ${(booking.carId as any).name}.`,
      'info',
      { type: 'booking', bookingId: booking._id.toString(), userType: 'host' }
    );

    return booking;
  }

  async reject(bookingId: string, vendorId: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId.toString() !== vendorId)
      throw new BadRequestException('Unauthorized');

    booking.status = BookingStatus.REJECTED;
    await booking.save();

    const customerUser = await this.userModel.findById(booking.customerId);
    const vendorUser = await this.userModel.findById(booking.vendorId);

    // Persistent Notification to Customer
    await this.sendCommunication(
      customerUser,
      'Booking Rejected',
      `Your booking request for ${(booking.carId as any).name} was declined by the host.`,
      'warning',
      { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' }
    );
    // Persistent Notification to Vendor
    await this.sendCommunication(
      vendorUser,
      'Booking Rejected',
      `You rejected the booking for ${(booking.carId as any).name}.`,
      'warning',
      { type: 'booking', bookingId: booking._id.toString(), userType: 'host' }
    );

    return booking;
  }

  async cancelByVendor(bookingId: string, vendorId: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId.toString() !== vendorId)
      throw new BadRequestException('Unauthorized');

    if (booking.status === BookingStatus.CONFIRMED) {
      // Refund to Wallet
      await this.userModel.findByIdAndUpdate(booking.customerId, {
        $inc: { walletBalance: booking.totalPrice },
      });
      booking.isRefunded = true;
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    const customerUser = await this.userModel.findById(booking.customerId);
    const vendorUser = await this.userModel.findById(booking.vendorId);

    // Persistent Notification to Customer
    await this.sendCommunication(
      customerUser,
      'Booking Cancelled',
      `Host cancelled your booking for ${(booking.carId as any).name}. Funds ($${booking.totalPrice}) have been refunded to your wallet.`,
      'warning',
      { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' }
    );

    // Notification to Host
    await this.sendCommunication(
      vendorUser,
      'Booking Cancelled',
      `You cancelled the booking for ${(booking.carId as any).name}.`,
      'info',
      { type: 'booking', bookingId: booking._id.toString(), userType: 'host' }
    );

    return booking;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async expirePendingBookings() {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const expiredBookings = await this.bookingModel.find({
      status: BookingStatus.PENDING,
      createdAt: { $lt: twentyFourHoursAgo },
      bookingType: 'Request',
    });

    for (const booking of expiredBookings) {
      booking.status = BookingStatus.CANCELLED;
      await booking.save();

      const customerUser = await this.userModel.findById(booking.customerId);
      const vendorUser = await this.userModel.findById(booking.vendorId);

      // Notify Customer
      await this.sendCommunication(
        customerUser,
        'Request Expired',
        'Your booking request expired as the vendor did not respond within 24 hours.',
        'info',
        { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' }
      );

      // Notify Vendor
      await this.sendCommunication(
        vendorUser,
        'Booking Expired',
        'A booking request has expired due to no response within 24 hours.',
        'warning',
        { type: 'booking', bookingId: booking._id.toString(), userType: 'host' }
      );
    }

    if (expiredBookings.length > 0) {
      console.log(
        `Auto-cancelled ${expiredBookings.length} expired booking requests.`,
      );
    }
  }

  async calculateRefundPercentage(booking: BookingDocument): Promise<number> {
    const settings = await this.settingModel.findById('cancellation');
    if (!settings || !(settings as any).isCancellationEnabled) return 0;

    const rules = (settings as any).rules || [];
    const defaultRefund = (settings as any).defaultRefundPercentage ?? 0;

    const now = new Date();
    const createdAt = new Date((booking as any).createdAt || (booking as any).updatedAt); // Fallback for seeds
    
    // Parse startDate and pickupTime (e.g. "2026-04-25" and "10:00")
    // We assume the date is in a format Date(str) can handle or combine them.
    const tripStart = new Date(`${booking.startDate}T${booking.pickupTime || '00:00'}`);

    const hoursSinceBooking = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    const hoursUntilTrip = (tripStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    let applicableRefund = -1;

    for (const rule of rules) {
      if (rule.type === 'within_booking_window') {
        if (hoursSinceBooking <= rule.hours) {
          applicableRefund = Math.max(applicableRefund, rule.refundPercentage);
        }
      } else if (rule.type === 'before_trip_start') {
        if (hoursUntilTrip >= rule.hours) {
          applicableRefund = Math.max(applicableRefund, rule.refundPercentage);
        }
      }
    }

    return applicableRefund === -1 ? defaultRefund : applicableRefund;
  }

  async cancelByCustomer(bookingId: string, customerId: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId)
      throw new BadRequestException('Unauthorized');

    if (booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.COMPLETED) {
      throw new BadRequestException('Booking cannot be cancelled in current status');
    }

    const refundPercentage = await this.calculateRefundPercentage(booking);
    const refundAmount = (booking.totalPrice * refundPercentage) / 100;

    if (refundAmount > 0) {
      await this.userModel.findByIdAndUpdate(booking.customerId, {
        $inc: { walletBalance: refundAmount },
      });
      booking.isRefunded = true;
    }

    booking.status = BookingStatus.CANCELLED;
    await booking.save();

    const vendorUser = await this.userModel.findById(booking.vendorId);
    const customerUser = await this.userModel.findById(booking.customerId);

    // Persistent Notification to Vendor
    await this.sendCommunication(
      vendorUser,
      'Booking Cancelled by Customer',
      `The customer cancelled the booking for ${(booking.carId as any).name}.`,
      'info',
      { type: 'booking', bookingId: booking._id.toString() }
    );

    // Persistent Notification to Customer
    await this.sendCommunication(
      customerUser,
      'Booking Cancelled',
      `You successfully cancelled your booking for ${(booking.carId as any).name}.`,
      'info',
      { type: 'booking', bookingId: booking._id.toString() }
    );

    return {
      message: 'Booking cancelled successfully',
      refundPercentage,
      refundAmount,
      booking
    };
  }

  async getById(id: string, userId: string) {
    const booking = await this.bookingModel
      .findById(id)
      .populate('carId')
      .populate({ path: 'vendorId', select: 'firstName lastName email phoneNumber avatar' })
      .populate({ path: 'customerId', select: 'firstName lastName email phoneNumber avatar' });
    if (!booking) throw new NotFoundException('Booking not found');

    // Security check: Only customer, vendor, or admin can see details
    const user = await this.userModel.findById(userId);
    const isAdmin = user?.role === 'admin';
    if (!isAdmin && booking.customerId._id.toString() !== userId && booking.vendorId._id.toString() !== userId) {
      throw new BadRequestException('Unauthorized access to booking details');
    }

    if (booking.tripStatus === 'host_submitted_check_out' && booking.paymentId && !booking.isSettled) {
      booking.isSettled = true;
      booking.customerAcceptedReturn = true;
      booking.status = BookingStatus.COMPLETED;
      await this.bookingModel.findByIdAndUpdate(booking._id, {
        isSettled: true,
        customerAcceptedReturn: true,
        status: BookingStatus.COMPLETED
      });
    }

    const bObj = booking.toObject();
    if (bObj.customerId && bObj.customerId._id) {
      const ver = await this.verificationModel.findOne({ userId: new Types.ObjectId(bObj.customerId._id) }).exec();
      if (ver) {
        (bObj.customerId as any).verificationSubmission = ver;
      }
    }
    return bObj;
  }

  async getUserBookings(userId: string) {
    console.log("Searching getUserBookings for customerId:", userId);
    const rawBookings = await this.bookingModel
      .find({ customerId: new Types.ObjectId(userId) })
      .populate('carId')
      .populate({ path: 'vendorId', select: 'firstName lastName email phoneNumber avatar' })
      .populate({ path: 'customerId', select: 'firstName lastName email phoneNumber avatar' })
      .sort({ createdAt: -1 });

    const bookings = [];
    for (const b of rawBookings) {
      if (b.tripStatus === 'host_submitted_check_out' && b.paymentId && !b.isSettled) {
        b.isSettled = true;
        b.customerAcceptedReturn = true;
        b.status = BookingStatus.COMPLETED;
        await this.bookingModel.findByIdAndUpdate(b._id, {
          isSettled: true,
          customerAcceptedReturn: true,
          status: BookingStatus.COMPLETED
        });
      }

      const bObj = b.toObject();
      if (bObj.customerId && bObj.customerId._id) {
        const ver = await this.verificationModel.findOne({ userId: new Types.ObjectId(bObj.customerId._id) }).exec();
        if (ver) {
          (bObj.customerId as any).verificationSubmission = ver;
        }
      }
      bookings.push(bObj);
    }
    return bookings;
  }

  async getVendorBookings(vendorId: string) {
    console.log("Searching getVendorBookings for vendorId:", vendorId);
    const rawBookings = await this.bookingModel
      .find({ vendorId: new Types.ObjectId(vendorId) })
      .populate('carId')
      .populate({ path: 'customerId', select: 'firstName lastName email phoneNumber avatar' })
      .sort({ createdAt: -1 });

    const bookings = [];
    for (const b of rawBookings) {
      if (b.tripStatus === 'host_submitted_check_out' && b.paymentId && !b.isSettled) {
        b.isSettled = true;
        b.customerAcceptedReturn = true;
        b.status = BookingStatus.COMPLETED;
        await this.bookingModel.findByIdAndUpdate(b._id, {
          isSettled: true,
          customerAcceptedReturn: true,
          status: BookingStatus.COMPLETED
        });
      }

      const bObj = b.toObject();
      if (bObj.customerId && bObj.customerId._id) {
        const ver = await this.verificationModel.findOne({ userId: new Types.ObjectId(bObj.customerId._id) }).exec();
        if (ver) {
          (bObj.customerId as any).verificationSubmission = ver;
        }
      }
      bookings.push(bObj);
    }
    return bookings;
  }

  async getCarAvailability(carId: string) {
    return this.bookingModel
      .find({
        carId: new Types.ObjectId(carId),
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.PENDING, BookingStatus.ACTIVE, BookingStatus.AWAITING_PAYMENT] },
      })
      .select('startDate endDate pickupTime returnTime status');
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  async checkUpcomingAndLateBookings() {
    const now = new Date();

    // 1. Clean up expired AWAITING_PAYMENT bookings (abandoned checkout)
    const expirationTime = new Date(now.getTime() - (30 * 60 * 1000));
    await this.bookingModel.updateMany(
      { status: BookingStatus.AWAITING_PAYMENT, updatedAt: { $lt: expirationTime } },
      { status: BookingStatus.CANCELLED }
    );

    const activeBookings = await this.bookingModel.find({
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] }
    }).populate('customerId vendorId carId');

    for (const booking of activeBookings) {
        const pickupDateStr = `${booking.startDate}T${booking.pickupTime || '00:00'}:00`;
        const returnDateStr = `${booking.endDate}T${booking.returnTime || '00:00'}:00`;
        const pickupDate = new Date(pickupDateStr);
        const returnDate = new Date(returnDateStr);

        const hrsUntilPickup = (pickupDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const hrsUntilReturn = (returnDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        const customer = booking.customerId as any;
        const vendor = booking.vendorId as any;
        const car = booking.carId as any;

        if (booking.status === BookingStatus.CONFIRMED) {
            // 24hr alert
            if (hrsUntilPickup <= 24 && hrsUntilPickup > 5 && !booking.pickupAlert24hSent) {
                booking.pickupAlert24hSent = true;
                await booking.save();
                const displayHrs = Math.round(hrsUntilPickup);
                const hrText = displayHrs === 1 ? 'hour' : 'hours';
                await this.sendCommunication(customer, `Upcoming Trip (${displayHrs}h)`, `Your trip with ${car.name} starts in ${displayHrs} ${hrText}.`, 'info', { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' });
                await this.sendCommunication(vendor, `Upcoming Trip (${displayHrs}h)`, `Your car ${car.name} is booked starting in ${displayHrs} ${hrText}.`, 'info', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });
            }
            // 5hr alert
            if (hrsUntilPickup <= 5 && hrsUntilPickup > 0 && !booking.pickupAlert5hSent) {
                booking.pickupAlert5hSent = true;
                await booking.save();
                const displayHrs = Math.round(hrsUntilPickup);
                const hrText = displayHrs === 1 ? 'hour' : 'hours';
                await this.sendCommunication(customer, `Upcoming Trip (${displayHrs}h)`, `Your trip with ${car.name} starts in ${displayHrs} ${hrText}. Please prepare.`, 'warning', { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' });
                await this.sendCommunication(vendor, `Upcoming Trip (${displayHrs}h)`, `Your car ${car.name} is picked up in ${displayHrs} ${hrText}.`, 'warning', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });
            }
        }

        if (booking.status === BookingStatus.ACTIVE) {
            // late return check (2-3 hrs before)
            if (hrsUntilReturn <= 3 && hrsUntilReturn > 1 && !booking.lateReturnAlertSent) {
                booking.lateReturnAlertSent = true;
                await booking.save();
                await this.sendCommunication(customer, 'Trip Ending Soon', `Your trip with ${car.name} ends in a few hours. Can you correctly return on time? Late returns incur fees. Please confirm in your dashboard.`, 'warning', { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' });
            }
        }
    }
  }

  async verifyConditionHost(bookingId: string, vendorId: string, mileage: number, conditionImage: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId.toString() !== vendorId) throw new BadRequestException('Unauthorized');
    if (booking.status !== BookingStatus.CONFIRMED) throw new BadRequestException('Booking is not confirmed yet');

    booking.hostMileage = mileage;
    booking.hostConditionImage = conditionImage;
    await booking.save();

    const customer = await this.userModel.findById(booking.customerId);
    await this.sendCommunication(customer, 'Please Verify Car Condition', `The host has submitted the car's condition. Please review and accept to pick up the vehicle.`, 'info', { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' });

    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async acceptConditionCustomer(bookingId: string, customerId: string, signature?: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId) throw new BadRequestException('Unauthorized');
    if (!booking.hostMileage && (!booking.checkInPhotos || booking.checkInPhotos.length === 0)) throw new BadRequestException('Host has not submitted condition yet');

    booking.checkInRenterSignature = signature;
    booking.customerAcceptedCondition = true;
    booking.tripStatus = 'checked_in';
    booking.status = BookingStatus.ACTIVE; // Set to Active
    await booking.save();

    const vendor = await this.userModel.findById(booking.vendorId);
    const car = await this.carModel.findById(booking.carId);
    await this.sendCommunication(vendor, 'Customer Picked Up Car', `The customer has accepted the condition and picked up ${car?.name || 'your vehicle'}.`, 'success', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async lateReturnResponse(bookingId: string, customerId: string, response: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId) throw new BadRequestException('Unauthorized');

    booking.lateReturnResponse = response;
    await booking.save();

    if (response === 'no') {
        const vendor = await this.userModel.findById(booking.vendorId);
        const car = await this.carModel.findById(booking.carId);
        
        await this.sendCommunication(vendor, 'Late Return Warning', `The customer for booking ${bookingId} has indicated they will be late. Please prepare accordingly.`, 'warning', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

        // Check for next booking
        const currentEnd = new Date(`${booking.endDate}T${booking.returnTime || '00:00'}:00`);
        const nextBooking = await this.bookingModel.findOne({
            carId: booking.carId,
            status: { $in: [BookingStatus.CONFIRMED] },
            startDate: { $gte: booking.endDate } 
        }).sort({ startDate: 1, pickupTime: 1 });

        if (nextBooking) {
             const nextStart = new Date(`${nextBooking.startDate}T${nextBooking.pickupTime || '00:00'}:00`);
             const diffHrs = (nextStart.getTime() - currentEnd.getTime()) / 3600000;
             if (diffHrs < 24) {
                 await this.sendCommunication(vendor, 'Urgent: Next Booking Alert', `There is a subsequent booking for ${car?.name} soon after this one. Since the current customer will be late, if you are ready to arrange another vehicle for the alternative it is ok, otherwise we will resolve this later.`, 'warning', { type: 'booking', bookingId: booking._id.toString() });
             }
        }
    }
    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async verifyReturnHost(bookingId: string, vendorId: string, mileage: number, conditionImage: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId.toString() !== vendorId) throw new BadRequestException('Unauthorized');
    if (booking.status !== BookingStatus.ACTIVE) throw new BadRequestException('Booking is not active');

    const car = await this.carModel.findById(booking.carId);
    
    // Calculate settlement
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    const includedDist = (car?.distanceIncluded || 200) * diffDays;
    const travelled = mileage - (booking.checkInMileage || booking.hostMileage || 0);
    const extraMiles = Math.max(0, travelled - includedDist);
    const settlement = extraMiles * (car?.extraDistanceFee || 0.5);

    booking.returnMileage = mileage;
    booking.returnConditionImage = conditionImage;
    booking.settlementAmount = settlement;
    booking.tripStatus = 'host_submitted_check_out';
    booking.customerAcceptedReturn = false;
    await booking.save();

    const customer = await this.userModel.findById(booking.customerId);
    await this.sendCommunication(customer, 'Return Condition Submitted', `The host has submitted the return condition for your trip. Please review settlement of $${settlement.toFixed(2)} and complete the booking.`, 'info', { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' });

    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async acceptReturnCustomer(bookingId: string, customerId: string, signature?: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId) throw new BadRequestException('Unauthorized');
    if (!booking.returnMileage && (!booking.checkOutPhotos || booking.checkOutPhotos.length === 0)) throw new BadRequestException('Host has not submitted return condition yet');

    booking.checkOutRenterSignature = signature;
    booking.customerAcceptedReturn = true;
    
    // Handle settlement payment (e.g. deduct from wallet or security deposit)
    if (booking.settlementAmount && booking.settlementAmount > 0) {
        const customer = await this.userModel.findById(customerId);
        if (customer && customer.walletBalance < booking.settlementAmount) {
            console.warn(`Customer ${customerId} has insufficient balance for settlement of ${booking.settlementAmount}`);
        }
        await this.userModel.findByIdAndUpdate(customerId, {
            $inc: { walletBalance: -booking.settlementAmount }
        });
    }

    booking.customerAcceptedReturn = true;
    booking.isSettled = true;
    booking.tripStatus = 'checked_out';
    booking.status = BookingStatus.COMPLETED;
    await booking.save();

    const vendor = await this.userModel.findById(booking.vendorId);
    const car = await this.carModel.findById(booking.carId);
    
    // Credit vendor for settlement (if any)
    if (booking.settlementAmount && booking.settlementAmount > 0) {
        await this.userModel.findByIdAndUpdate(booking.vendorId, {
            $inc: { walletBalance: booking.settlementAmount }
        });
    }

    await this.sendCommunication(vendor, 'Trip Completed', `The customer has accepted the return condition and completed the trip for ${car?.name}. Settlement of $${(booking.settlementAmount || 0).toFixed(2)} processed.`, 'success', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async rejectConditionCustomer(bookingId: string, customerId: string, reason: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId) throw new BadRequestException('Unauthorized');

    booking.handoverRejectionCount = (booking.handoverRejectionCount || 0) + 1;
    booking.hostMileage = undefined; // Reset host input
    booking.hostConditionImage = undefined;
    booking.checkInPhotos = [];
    booking.checkInMileage = undefined;
    booking.checkInFuelLevel = undefined;
    booking.checkInNotes = undefined;
    booking.tripStatus = 'not_started';

    if (booking.handoverRejectionCount >= 3) {
      booking.status = BookingStatus.CANCELLED;
      booking.isRefunded = true;
      await booking.save();

      await this.userModel.findByIdAndUpdate(customerId, {
        $inc: { walletBalance: booking.totalPrice }
      });

      const vendor = await this.userModel.findById(booking.vendorId);
      const customer = await this.userModel.findById(customerId);

      await this.sendCommunication(vendor, 'Booking Cancelled: Repeated Handover Rejections', `The customer rejected the handover documentation 3 times. The booking for ${(booking.carId as any)?.name} has been automatically cancelled and refunded.`, 'error', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });
      await this.sendCommunication(customer, 'Booking Cancelled & Refunded', `After 3 unsuccessful handover documentation attempts by the host, your booking has been cancelled and a full refund of $${booking.totalPrice} has been credited to your wallet.`, 'info', { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' });

      return this.bookingModel.findById(booking._id).populate('carId');
    }

    await booking.save();

    const vendor = await this.userModel.findById(booking.vendorId);
    await this.sendCommunication(vendor, 'Handover Condition Rejected', `The customer rejected the car condition documents. Reason: ${reason}. Please submit correct documentation. Rejection count: ${booking.handoverRejectionCount}/3`, 'warning', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async rejectReturnCustomer(bookingId: string, customerId: string, reason: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId) throw new BadRequestException('Unauthorized');

    booking.returnMileage = undefined;
    booking.returnConditionImage = undefined;
    booking.checkOutPhotos = [];
    booking.checkOutMileage = undefined;
    booking.checkOutFuelLevel = undefined;
    booking.checkOutNotes = undefined;
    booking.tripStatus = 'checked_in';
    await booking.save();

    const vendor = await this.userModel.findById(booking.vendorId);
    await this.sendCommunication(vendor, 'Return Settlement Disputed', `The customer disputed the return condition/settlement. Reason: ${reason}. Please review and submit correct return details.`, 'warning', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async reportHost(bookingId: string, customerId: string, reason: string, details: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId.toString() !== customerId) throw new BadRequestException('Unauthorized');

    const customer = await this.userModel.findById(customerId);
    const host = await this.userModel.findById(booking.vendorId);
    
    if (!customer || !host) {
      throw new NotFoundException('Customer or Host not found for this escalation.');
    }

    // 1. Create Report
    await this.reportModel.create({
      reporterId: new Types.ObjectId(customerId),
      reportedId: booking.vendorId,
      bookingId: booking._id,
      reason,
      details
    });

    // 2. Full Refund
    await this.userModel.findByIdAndUpdate(customerId, {
      $inc: { walletBalance: booking.totalPrice }
    });

    // 3. Cancel Booking
    booking.status = BookingStatus.CANCELLED;
    booking.isRefunded = true;
    await booking.save();

    // 4. Notify Host
    await this.sendCommunication(host, 'Host Reported & Booking Cancelled', `You have been reported for repeated non-compliance with handover documentation. The booking for ${(booking.carId as any).name} has been cancelled with a full refund to the customer.`, 'error', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

    // 5. Notify Admin (System notification)
    const adminQuery = await this.userModel.find({ role: 'admin' });
    for (const admin of adminQuery) {
       await this.sendCommunication(admin, 'URGENT: Host Reported', `Host ${host.firstName} ${host.lastName} was reported by Customer ${customer.firstName} ${customer.lastName} after 3 failed handover attempts. Booking: ${booking._id}`, 'error', { type: 'report', bookingId: booking._id.toString() });
    }

    return this.bookingModel.findById(booking._id).populate('carId');
  }

  async checkIn(bookingId: string, userId: string, data: any) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    
    if (booking.customerId.toString() !== userId && booking.vendorId.toString() !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    booking.checkInPhotos = data.photos || [];
    booking.checkInMileage = data.mileage;
    booking.checkInFuelLevel = data.fuelLevel;
    booking.checkInNotes = data.notes;
    booking.checkInHostSignature = data.signature;
    booking.hostMileage = data.mileage;
    booking.hostConditionImage = data.photos?.[0] || '';
    booking.tripStatus = 'host_submitted_check_in';
    booking.customerAcceptedCondition = false;
    
    await booking.save();
    
    const otherUserId = booking.customerId.toString() === userId ? booking.vendorId : booking.customerId;
    const otherUser = await this.userModel.findById(otherUserId);
    await this.sendCommunication(
      otherUser, 
      'Check-In Submitted: Verification Required', 
      `The host has submitted check-in photos and details for ${booking.bookingHash}. Please review and accept to officially start your trip.`, 
      'info',
      { type: 'booking', bookingId: booking._id.toString() }
    );

    return booking;
  }

  async acceptAgreement(bookingId: string, userId: string, ip: string, userAgent: string, signatureBase64: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    
    if (booking.customerId.toString() === userId) {
      booking.renterAgreementSignature = {
        acceptedAt: new Date(),
        ipAddress: ip,
        userAgent: userAgent,
        signatureBase64: signatureBase64
      };
    } else if (booking.vendorId.toString() === userId) {
      booking.hostAgreementSignature = {
        acceptedAt: new Date(),
        ipAddress: ip,
        userAgent: userAgent,
        signatureBase64: signatureBase64
      };
    } else {
      throw new BadRequestException('Unauthorized');
    }
    
    await booking.save();
    return booking;
  }

  async generateAgreementPdf(bookingId: string) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    
    // Stub implementation to satisfy TS. In a real scenario, you'd use pdfkit or puppeteer
    const fs = require('fs');
    const path = require('path');
    const PDFDocument = require('pdfkit');
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });
      
      doc.fontSize(20).text('Rental Agreement', { align: 'center' });
      doc.moveDown();
      doc.fontSize(12).text(`Booking ID: ${booking._id}`);
      doc.text(`Booking Hash: ${booking.bookingHash}`);
      doc.end();
    });
  }

  async checkOut(bookingId: string, userId: string, data: any) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) throw new NotFoundException('Booking not found');
    
    if (booking.customerId.toString() !== userId && booking.vendorId.toString() !== userId) {
      throw new BadRequestException('Unauthorized');
    }

    const car = await this.carModel.findById(booking.carId);
    
    // Calculate settlement
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    const diffDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    const includedDist = (car?.distanceIncluded || 200) * diffDays;
    const travelled = data.mileage - (booking.checkInMileage || booking.hostMileage || 0);
    const extraMiles = Math.max(0, travelled - includedDist);
    const settlement = extraMiles * (car?.extraDistanceFee || 0.5);

    booking.checkOutPhotos = data.photos || [];
    booking.checkOutMileage = data.mileage;
    booking.checkOutFuelLevel = data.fuelLevel;
    booking.checkOutNotes = data.notes;
    booking.checkOutHostSignature = data.signature;
    booking.returnMileage = data.mileage;
    booking.returnConditionImage = data.photos?.[0] || '';
    booking.settlementAmount = settlement;
    booking.tripStatus = 'host_submitted_check_out';
    booking.customerAcceptedReturn = false;
    
    await booking.save();

    const otherUserId = booking.customerId.toString() === userId ? booking.vendorId : booking.customerId;
    const otherUser = await this.userModel.findById(otherUserId);
    await this.sendCommunication(
      otherUser, 
      'Return Submitted: Verification Required', 
      `The host has submitted return photos and details for ${booking.bookingHash}. Please review settlement of $${settlement.toFixed(2)} and accept to conclude the trip.`, 
      'info',
      { type: 'booking', bookingId: booking._id.toString() }
    );

    return booking;
  }
  async submitClaim(bookingId: string, userId: string, claimData: any) {
    const booking = await this.bookingModel.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    if (
      booking.customerId.toString() !== userId &&
      booking.vendorId.toString() !== userId
    ) {
      throw new NotFoundException('Booking not found');
    }

    booking.claimDetails = {
      description: claimData.description,
      dateOfIncident: claimData.dateOfIncident,
      photos: claimData.photos || [],
      status: 'Pending',
      submittedAt: new Date(),
    };

    return booking.save();
  }
}
