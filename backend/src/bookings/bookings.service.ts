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
    const admin = await this.userModel.findOne({ role: 'admin' });
    if (admin) {
      // Add PENDING transaction to Admin's Wallet (Escrow)
      await this.walletService.addPendingFunds(
        admin._id.toString(),
        commissionAmount,
        `Pending Commission for Booking #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}`,
        booking._id.toString()
      );
      
      // Add PENDING transaction to Host's Wallet (Escrow)
      const baseAmt = (booking as any).baseAmount ?? booking.totalPrice;
      const hostTripEarnings = Math.max(0, baseAmt - commissionAmount);
      if (hostTripEarnings > 0) {
        await this.walletService.addPendingFunds(
          booking.vendorId.toString(),
          hostTripEarnings,
          `Pending Payout for Booking #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}`,
          booking._id.toString()
        );
      }

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
    
    if (!customerUser.licenseExpiryDate) {
      throw new BadRequestException('Your license is missing, expired, or will expire before your trip ends. Please update your license in your profile.');
    }
    
    const expiryDateEndOfDay = new Date(customerUser.licenseExpiryDate);
    expiryDateEndOfDay.setHours(23, 59, 59, 999);

    if (expiryDateEndOfDay.getTime() < bookingEndDate.getTime()) {
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
      // Cancel pending escrow funds
      await this.walletService.cancelPendingFunds(booking._id.toString(), 'Host Cancelled');

      // Refund to Wallet
      await this.userModel.findByIdAndUpdate(booking.customerId, {
        $inc: { walletBalance: booking.totalPrice },
      });
      await this.walletService.addFunds(
        booking.customerId.toString(),
        booking.totalPrice,
        `Refund for cancelled booking ${(booking.carId as any).name}`,
        TransactionSource.REFUND,
        booking._id.toString()
      );
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

    if (booking.status === BookingStatus.CONFIRMED) {
      // Cancel pending escrow funds
      await this.walletService.cancelPendingFunds(booking._id.toString(), 'Customer Cancelled');
    }

    if (refundAmount > 0) {
      await this.userModel.findByIdAndUpdate(booking.customerId, {
        $inc: { walletBalance: refundAmount },
      });
      await this.walletService.addFunds(
        booking.customerId.toString(),
        refundAmount,
        `Refund for cancelled booking ${(booking.carId as any).name} (${refundPercentage}% Policy)`,
        TransactionSource.REFUND,
        booking._id.toString()
      );
      booking.isRefunded = true;
    }

    // Cancellation Penalty Split
    const cancellationFee = booking.totalPrice - refundAmount;
    if (booking.status === BookingStatus.CONFIRMED && cancellationFee > 0) {
      const financeSettings = await this.settingModel.findById('financials');
      const rate = financeSettings ? (financeSettings as any).commissionRate : 15;
      const adminFee = (cancellationFee * rate) / 100;
      const hostFee = cancellationFee - adminFee;

      const admin = await this.userModel.findOne({ role: 'admin' });
      if (admin && adminFee > 0) {
        await this.userModel.findByIdAndUpdate(admin._id, { $inc: { walletBalance: adminFee } });
        await this.walletService.addFunds(admin._id.toString(), adminFee, `Cancellation Fee Cut (Booking #${booking._id.toString().slice(-8).toUpperCase()})`, TransactionSource.BOOKING, booking._id.toString());
      }
      if (hostFee > 0) {
        await this.userModel.findByIdAndUpdate(booking.vendorId, { $inc: { walletBalance: hostFee } });
        await this.walletService.addFunds(booking.vendorId.toString(), hostFee, `Cancellation Payout (Booking #${booking._id.toString().slice(-8).toUpperCase()})`, TransactionSource.BOOKING, booking._id.toString());
      }
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
      .populate({ path: 'carId', populate: [{ path: 'brand', model: 'Brand' }, { path: 'vehicleType', model: 'CarType' }] })
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

  async getAllBookings() {
    console.log("Fetching all bookings for admin view");
    const rawBookings = await this.bookingModel
      .find({})
      .populate('carId')
      .populate({ path: 'vendorId', select: 'firstName lastName email phoneNumber avatar' })
      .populate({ path: 'customerId', select: 'firstName lastName email phoneNumber avatar' })
      .sort({ createdAt: -1 });

    const bookings = [];
    for (const b of rawBookings) {


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
    
    if (!booking.renterAgreementSignature || !booking.renterAgreementSignature.signatureBase64) {
      throw new BadRequestException('You must sign the Rental Agreement before authorizing Check-In.');
    }

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

  async requestDelay(bookingId: string, customerId: string, reason: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId customerId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customerId._id.toString() !== customerId && booking.customerId.toString() !== customerId) throw new BadRequestException('Unauthorized');

    booking.delayRequested = true;
    booking.delayReason = reason;
    await booking.save();

    const vendor = await this.userModel.findById(booking.vendorId);
    const car: any = booking.carId;
    const customer: any = booking.customerId;

    // Send a message via chat service if possible, or just a notification
    await this.sendCommunication(vendor, 'Trip Delay Requested', `Customer ${customer?.firstName || 'User'} has requested a delay for ${car?.name || 'the vehicle'}. Reason: "${reason}". Please coordinate with them or extend the trip.`, 'warning', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

    // Assuming there's a chat system, we could auto-send a message, but notification suffices if chat is separate.
    return booking;
  }

  async extendTrip(bookingId: string, vendorId: string, newEndDate: string, newReturnTime: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.vendorId.toString() !== vendorId) throw new BadRequestException('Unauthorized');

    // Overlap validation
    const requestedEnd = new Date(`${newEndDate}T${newReturnTime}:00`);
    const currentEnd = new Date(`${booking.endDate}T${booking.returnTime || '00:00'}:00`);
    if (requestedEnd <= currentEnd) {
       throw new BadRequestException('New end date/time must be after the current end date/time.');
    }

    const existingBookings = await this.bookingModel.find({
        carId: booking.carId,
        status: { $in: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE] },
        _id: { $ne: booking._id }
    });

    for (const eb of existingBookings) {
      const ebStart = new Date(`${eb.startDate}T${eb.pickupTime || '00:00'}:00`);
      const ebEnd = new Date(`${eb.endDate}T${eb.returnTime || '00:00'}:00`);
      
      const bufferMs = 60 * 60 * 1000;
      const isOverlapping = (currentEnd.getTime() < ebEnd.getTime() + bufferMs) && 
                           (requestedEnd.getTime() + bufferMs > ebStart.getTime());

      if (isOverlapping) {
         throw new BadRequestException('Cannot extend: The car is already booked during the requested extension period.');
      }
    }

    // Calculate extra days
    const diffTime = requestedEnd.getTime() - currentEnd.getTime();
    const extraDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const car: any = booking.carId;
    
    const extraCharge = extraDays * (car.pricePerDay || 0);

    booking.endDate = newEndDate;
    booking.returnTime = newReturnTime;
    booking.extensionCharge = (booking.extensionCharge || 0) + extraCharge;
    // We intentionally do not add this to totalPrice or baseAmount so that the original payment intent 
    // matches the captured amount. The extensionCharge will be paid at settlement.
    booking.delayRequested = false; // Resolved
    
    await booking.save();

    const customer = await this.userModel.findById(booking.customerId);
    await this.sendCommunication(customer, 'Trip Extended', `Your trip for ${car?.name} has been extended to ${newEndDate} at ${newReturnTime}. Extra charges have been applied.`, 'success', { type: 'booking', bookingId: booking._id.toString(), userType: 'renter' });

    return booking;
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
    let settlement = extraMiles * (car?.extraDistanceFee || 0.5);

    // Overdue Calculation
    const scheduledEnd = new Date(`${booking.endDate}T${booking.returnTime || '00:00'}:00`);
    const actualEnd = new Date();
    const gracePeriodMs = 60 * 60 * 1000; // 1 hour

    if (actualEnd.getTime() > scheduledEnd.getTime() + gracePeriodMs) {
       const delayMs = actualEnd.getTime() - scheduledEnd.getTime();
       const extraDays = Math.ceil(delayMs / (24 * 60 * 60 * 1000));
       const overdueCharge = extraDays * (car?.pricePerDay || 0);
       settlement += overdueCharge;
    }

    // Add unpaid extension charges if any
    if (booking.extensionCharge) {
       settlement += booking.extensionCharge;
    }

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
    
    // Calculate Host Payout: Base Amount minus Platform Fee
    // If baseAmount is undefined, fallback to totalPrice minus platformFee.
    const baseAmt = (booking as any).baseAmount ?? booking.totalPrice;
    const pFee = (booking as any).platformFee ?? 0;
    const hostTripEarnings = Math.max(0, baseAmt - pFee);
    
    // Include any extra settlement (damages, late fees, etc)
    const extraSettlement = booking.settlementAmount && booking.settlementAmount > 0 ? booking.settlementAmount : 0;
    const totalHostPayout = hostTripEarnings + extraSettlement;

    if (totalHostPayout > 0) {
        // Update user's fast-access wallet balance
        await this.userModel.findByIdAndUpdate(booking.vendorId, {
            $inc: { walletBalance: totalHostPayout }
        });
        
        // Finalize the pending escrow funds to digital wallet
        const finalizedTx = await this.walletService.finalizePendingFunds(
            booking.vendorId.toString(),
            booking._id.toString(),
            totalHostPayout,
            `Trip Payout for ${car?.name || 'Booking'} #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}${extraSettlement > 0 ? ' (Includes Settlement)' : ''}`
        );

        // If for some reason there was no pending tx (e.g. legacy booking), fallback to addFunds
        if (!finalizedTx) {
            await this.walletService.addFunds(
                booking.vendorId.toString(),
                totalHostPayout,
                `Trip Payout for ${car?.name || 'Booking'} #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}${extraSettlement > 0 ? ' (Includes Settlement)' : ''}`,
                TransactionSource.BOOKING,
                booking._id.toString()
            );
        }
    }

    // Finalize Admin Commission
    const admin = await this.userModel.findOne({ role: 'admin' });
    if (admin && pFee > 0) {
        await this.userModel.findByIdAndUpdate(admin._id, {
            $inc: { walletBalance: pFee }
        });
        const finalizedAdminTx = await this.walletService.finalizePendingFunds(
            admin._id.toString(),
            booking._id.toString(),
            pFee,
            `Commission collected from Booking #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}`
        );
        if (!finalizedAdminTx) {
            await this.walletService.addFunds(
                admin._id.toString(),
                pFee,
                `Commission collected from Booking #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}`,
                TransactionSource.BOOKING,
                booking._id.toString()
            );
        }
    }

    await this.sendCommunication(vendor, 'Trip Completed & Payout Processed', `The trip for ${car?.name} is completed. A total payout of $${totalHostPayout.toFixed(2)} has been credited to your wallet.`, 'success', { type: 'booking', bookingId: booking._id.toString(), userType: 'host' });

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
      // Cancel pending escrow funds
      await this.walletService.cancelPendingFunds(booking._id.toString(), 'Auto-cancelled due to handover rejections');

      booking.status = BookingStatus.CANCELLED;
      booking.isRefunded = true;
      await booking.save();

      await this.userModel.findByIdAndUpdate(customerId, {
        $inc: { walletBalance: booking.totalPrice }
      });
      await this.walletService.addFunds(
        customerId.toString(),
        booking.totalPrice,
        `Refund for cancelled booking ${(booking.carId as any)?.name} (Handover Rejections)`,
        TransactionSource.REFUND,
        booking._id.toString()
      );

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

    // 2. Cancel Escrow & Full Refund
    await this.walletService.cancelPendingFunds(booking._id.toString(), 'Host Reported');

    await this.userModel.findByIdAndUpdate(customerId, {
      $inc: { walletBalance: booking.totalPrice }
    });
    await this.walletService.addFunds(
      customerId.toString(),
      booking.totalPrice,
      `Refund for cancelled booking ${(booking.carId as any)?.name} (Host Reported)`,
      TransactionSource.REFUND,
      booking._id.toString()
    );

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
    const booking: any = await this.bookingModel.findById(bookingId)
      .populate({ path: 'carId', populate: [{ path: 'vehicleType', model: 'CarType' }, { path: 'brand', model: 'Brand' }] })
      .populate('customerId vendorId');
    if (!booking) throw new NotFoundException('Booking not found');

    const ver = booking.customerId ? await this.verificationModel.findOne({ userId: booking.customerId._id }).exec() : null;
    const docs = ver?.documents || [];
    const dlNum = docs.find((d: any) => d.fieldId === 'driverLicense')?.value || booking.customerId?.driverLicense;
    const dlExp = docs.find((d: any) => d.fieldId === 'licenseExpiryDate')?.value || booking.customerId?.licenseExpiryDate;
    const dob = docs.find((d: any) => d.fieldId === 'dob')?.value || booking.customerId?.dob;
    
    const PDFDocument = require('pdfkit');
    
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: any[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const drawSectionHeader = (title: string, color: string, y: number) => {
        doc.rect(50, y, 4, 14).fill(color);
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(title, 62, y + 2, { tracking: 1.5 });
        return y + 30;
      };

      // Header
      doc.fillColor('#0f172a').fontSize(24).font('Helvetica-Bold').text('RENTAL AGREEMENT', { align: 'right' });
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#64748b').text(`REF: ${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}`, { align: 'right' });
      doc.text(`Issued: ${new Date(booking.agreementGeneratedAt || booking.createdAt).toLocaleDateString()}`, { align: 'right' });
      
      let currentY = 120;

      doc.rect(0, 0, doc.page.width, 100).fill('#0f172a');
      doc.fillColor('#ffffff').fontSize(24).font('Helvetica-Bold').text('RENTAL AGREEMENT', 50, 40);
      doc.fontSize(10).font('Helvetica').text(`AGREEMENT REF: #${booking._id.toString().slice(-6).toUpperCase()}`, doc.page.width - 250, 40, { align: 'right' });
      doc.text(`ISSUED: ${new Date().toLocaleDateString()}`, doc.page.width - 250, 55, { align: 'right' });

      doc.moveTo(50, 120).lineTo(545, 120).lineWidth(1.5).strokeColor('#0f172a').stroke();

      currentY = 150;

      const drawBox = (x: number, y: number, width: number, height: number) => {
         doc.roundedRect(x, y, width, height, 6).lineWidth(1).strokeColor('#e2e8f0').fillAndStroke('#f8fafc', '#e2e8f0');
      };

      // RENTER & HOST
      doc.rect(50, currentY, 4, 14).fill('#0f172a');
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('RENTER (LESSEE)', 62, currentY + 2, { tracking: 1.5 });

      doc.rect(290, currentY, 4, 14).fill('#e11d48');
      doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text('HOST (LESSOR)', 302, currentY + 2, { tracking: 1.5 });

      currentY += 30;

      drawBox(50, currentY, 230, 110);
      drawBox(290, currentY, 230, 110);

      const renterName = booking.renterLegalName || `${booking.customerId?.firstName || ''} ${booking.customerId?.lastName || ''}`.trim() || 'Guest';
      const hostName = booking.hostLegalName || `${booking.vendorId?.firstName || ''} ${booking.vendorId?.lastName || ''}`.trim() || 'Host';

      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(renterName, 65, currentY + 15);
      doc.fillColor('#475569').fontSize(10).font('Helvetica').text(booking.customerId?.email || 'No email provided', 65, currentY + 32);
      if (booking.customerId?.phone) doc.text(booking.customerId?.phone, 65, currentY + 45);
      
      doc.fillColor('#64748b').fontSize(8);
      if (dlNum) doc.text(`DL Number: ${dlNum}`, 65, currentY + 60);
      if (dlExp) {
         const expDate = new Date(dlExp);
         if (!isNaN(expDate.getTime())) doc.text(`DL Expiry: ${expDate.toLocaleDateString()}`, 65, currentY + 72);
      }
      if (dob) {
         const dobDate = new Date(dob);
         if (!isNaN(dobDate.getTime())) doc.text(`DOB: ${dobDate.toLocaleDateString()}`, 65, currentY + 84);
         else doc.text(`DOB: ${dob}`, 65, currentY + 84);
      }

      doc.fillColor('#0f172a').fontSize(12).font('Helvetica-Bold').text(hostName, 305, currentY + 15);
      doc.fillColor('#475569').fontSize(10).font('Helvetica').text(booking.vendorId?.email || 'No email provided', 305, currentY + 32);
      if (booking.vendorId?.phone) doc.text(booking.vendorId?.phone, 305, currentY + 45);

      currentY += 140;

      // VEHICLE & SCHEDULE
      currentY = drawSectionHeader('VEHICLE & SCHEDULE', '#94a3b8', currentY);
      
      const drawTableRow = (y: number, label: string, value: string, isLast: boolean = false) => {
         // Background for left column to match the web UI lightly
         doc.rect(51, y, 140, 35).fill('#f8fafc');
         doc.fillColor('#64748b').fontSize(8).font('Helvetica-Bold').text(label, 65, y + 14, { tracking: 1 });
         doc.fillColor('#0f172a').fontSize(10).font('Helvetica-Bold').text(value, 205, y + 13);
         if (!isLast) {
             doc.moveTo(50, y + 35).lineTo(530, y + 35).lineWidth(1).strokeColor('#e2e8f0').stroke();
         }
      };

      doc.roundedRect(50, currentY, 480, 280, 6).fill('#ffffff');
      
      let tableY = currentY;
      drawTableRow(tableY, 'VEHICLE', booking.carId?.name || 'Premium Vehicle'); tableY += 35;
      
      const makeModel = `${booking.carId?.brand?.name || ''} ${booking.carId?.model || ''}`.trim() || 'N/A';
      drawTableRow(tableY, 'MAKE & MODEL', makeModel); tableY += 35;
      
      const category = booking.carId?.vehicleType?.name || 'Standard Car';
      drawTableRow(tableY, 'CATEGORY', category); tableY += 35;
      
      const specs = [
        booking.carId?.color ? `Color: ${booking.carId.color}` : '',
        booking.carId?.seats ? `Seats: ${booking.carId.seats}` : '',
        booking.carId?.doors ? `Doors: ${booking.carId.doors}` : ''
      ].filter(Boolean).join(' | ');
      drawTableRow(tableY, 'DETAILS', specs || 'Standard specs'); tableY += 35;

      const mechanics = [
        booking.carId?.transmission ? `Trans: ${booking.carId.transmission}` : '',
        booking.carId?.fuelType ? `Fuel: ${booking.carId.fuelType}` : '',
        booking.carId?.mileage ? `Mileage: ${booking.carId.mileage.toLocaleString()} mi` : ''
      ].filter(Boolean).join(' | ');
      drawTableRow(tableY, 'MECHANICS', mechanics || 'Standard specs'); tableY += 35;

      drawTableRow(tableY, 'VIN / PLATE', booking.carId?.vin || booking.carId?.licensePlate || 'On Record'); tableY += 35;
      drawTableRow(tableY, 'CHECK-IN', `Date: ${booking.startDate} | Time: ${booking.pickupTime || '10:00'}`); tableY += 35;
      drawTableRow(tableY, 'CHECK-OUT', `Date: ${booking.endDate} | Time: ${booking.returnTime || '10:00'}`, true);
      
      doc.roundedRect(50, currentY, 480, 280, 6).lineWidth(1).strokeColor('#e2e8f0').stroke(); 

      currentY += 310;

      if (currentY > 600) { doc.addPage(); currentY = 50; }

      // FINANCIAL DETAILS
      currentY = drawSectionHeader('FINANCIAL DETAILS', '#10b981', currentY);
      doc.roundedRect(50, currentY, 480, 175, 6).fill('#ffffff');
      
      tableY = currentY;
      drawTableRow(tableY, 'BASE RATE', booking.carId?.pricePerDay ? `$${booking.carId.pricePerDay.toFixed(2)} / Day` : 'N/A'); tableY += 35;
      drawTableRow(tableY, 'TOTAL PAID', `$${booking.totalPrice?.toFixed(2) || '0.00'}`); tableY += 35;
      drawTableRow(tableY, 'PAYMENT METHOD', (booking.paymentMethod || 'Credit Card').toUpperCase()); tableY += 35;
      const deposit = booking.breakdown?.securityDeposit;
      drawTableRow(tableY, 'SECURITY DEPOSIT', deposit ? `$${deposit.toFixed(2)}` : 'None'); tableY += 35;
      drawTableRow(tableY, 'EXTRAS', booking.extras?.length ? booking.extras.join(', ') : 'None', true);

      doc.roundedRect(50, currentY, 480, 175, 6).lineWidth(1).strokeColor('#e2e8f0').stroke();

      currentY += 205;

      if (currentY > 600) { doc.addPage(); currentY = 50; }

      // TERMS OF AGREEMENT
      currentY = drawSectionHeader('TERMS OF AGREEMENT', '#0f172a', currentY);
      
      const terms = booking.agreementText || `This Rental Agreement (the "Agreement") governs the rental of the vehicle specified above. By executing this document, both the Renter and the Host acknowledge and agree to the following conditions:\n\n1. ACCEPTANCE OF CONDITION\nThe Renter accepts the vehicle in its current state. Any pre-existing damage must be documented in the Check-In process prior to departure.\n\n2. USAGE LIMITATIONS\nThe vehicle shall not be used for racing, towing, illegal activities, or driven by unauthorized persons. Smoking and pets are strictly prohibited unless explicitly allowed by the Host.\n\n3. FINANCIAL RESPONSIBILITY\nThe Renter is fully responsible for all tolls, parking citations, and traffic violations incurred during the rental period. The security deposit (if applicable) may be withheld for damages, late returns, or cleaning fees.\n\n4. FUEL AND MILEAGE\nThe vehicle must be returned with the same fuel level as provided at Check-In. Exceeding the allotted mileage will incur additional per-mile charges as specified in the booking details.\n\nIN WITNESS WHEREOF, the parties hereto have executed this Agreement electronically.`;
      
      doc.fontSize(8).font('Courier');
      const termsHeight = doc.heightOfString(terms, { width: 450, align: 'justify', lineGap: 2 });
      doc.roundedRect(50, currentY, 480, termsHeight + 30, 6).fillAndStroke('#f8fafc', '#e2e8f0');
      doc.fillColor('#475569').text(terms, 65, currentY + 15, { width: 450, align: 'justify', lineGap: 2 });

      currentY += termsHeight + 60;

      if (currentY > 600) { doc.addPage(); currentY = 50; }

      // SIGNATURES
      currentY = drawSectionHeader('SIGNATURES', '#3b82f6', currentY);

      doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Bold').text('RENTER (LESSEE)', 50, currentY, { tracking: 1 });
      doc.fillColor('#94a3b8').fontSize(8).font('Helvetica-Bold').text('HOST (LESSOR)', 300, currentY, { tracking: 1 });

      currentY += 20;

      // Renter Signature
      if (booking.renterAgreementSignature) {
        if (booking.renterAgreementSignature.signatureBase64) {
           try {
             const b64 = booking.renterAgreementSignature.signatureBase64.split(',')[1];
             if (b64) doc.image(Buffer.from(b64, 'base64'), 50, currentY, { width: 120 });
           } catch(e) { console.error('Renter PDF sig err', e); }
        }
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(renterName, 50, currentY + 60);
        const rTime = booking.renterAgreementSignature.acceptedAt ? new Date(booking.renterAgreementSignature.acceptedAt).toISOString() : 'N/A';
        doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(`Time: ${rTime}`, 50, currentY + 75);
        doc.text(`IP: ${booking.renterAgreementSignature.ipAddress || 'Unknown'}`, 50, currentY + 85);
      } else {
        doc.fillColor('#0f172a').font('Helvetica').fontSize(10).text('Pending Signature...', 50, currentY + 30);
      }
      
      // Host Signature
      if (booking.hostAgreementSignature) {
        if (booking.hostAgreementSignature.signatureBase64) {
           try {
             const b64 = booking.hostAgreementSignature.signatureBase64.split(',')[1];
             if (b64) doc.image(Buffer.from(b64, 'base64'), 300, currentY, { width: 120 });
           } catch(e) { console.error('Host PDF sig err', e); }
        }
        doc.fillColor('#0f172a').font('Helvetica-Bold').fontSize(10).text(hostName, 300, currentY + 60);
        const hTime = booking.hostAgreementSignature.acceptedAt ? new Date(booking.hostAgreementSignature.acceptedAt).toISOString() : 'N/A';
        doc.fillColor('#64748b').font('Helvetica').fontSize(8).text(`Time: ${hTime}`, 300, currentY + 75);
        doc.text(`IP: ${booking.hostAgreementSignature.ipAddress || 'Unknown'}`, 300, currentY + 85);
      } else {
        doc.fillColor('#0f172a').font('Helvetica').fontSize(10).text('Pending Signature...', 300, currentY + 30);
      }

      if (booking.agreementHash) {
         currentY += 120;
         doc.moveTo(50, currentY).lineTo(530, currentY).lineWidth(1).strokeColor('#e2e8f0').stroke();
         currentY += 15;
         doc.fillColor('#10b981').fontSize(8).font('Helvetica-Bold').text('CRYPTOGRAPHICALLY SECURED', 50, currentY, { align: 'center', tracking: 1 });
         doc.fillColor('#94a3b8').font('Courier').text(`SHA-256: ${booking.agreementHash}`, 50, currentY + 12, { align: 'center' });
      }

      this.settingModel.findById('general').lean().then(generalSettings => {
        const siteName = (generalSettings as any)?.siteName || 'CarRental';
        doc.fillColor('#cbd5e1').fontSize(6).font('Helvetica-Bold').text(
          `DOCUMENT VISUALLY GENERATED BY ${siteName.toUpperCase()} · VALID UNDER PREVAILING LOCAL LAWS`,
          0, doc.page.height - 60, { align: 'center', tracking: 1 }
        );
        doc.end();
      }).catch(err => {
        doc.fillColor('#cbd5e1').fontSize(6).font('Helvetica-Bold').text(
          `DOCUMENT VISUALLY GENERATED BY CARRENTAL · VALID UNDER PREVAILING LOCAL LAWS`,
          0, doc.page.height - 30, { align: 'center', tracking: 1 }
        );
        doc.end();
      });
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

    await booking.save();

    // Notify all active admins (Urgent Alert)
    const admins = await this.userModel.find({ role: 'admin' }).exec();
    const primaryAdminEmail = 'admin@gmail.com';
    if (!admins.find(a => a.email === primaryAdminEmail)) {
      const primaryAdmin = await this.userModel.findOne({ email: primaryAdminEmail }).exec();
      if (primaryAdmin) admins.push(primaryAdmin);
    }
    
    const user = await this.userModel.findById(userId);
    const userName = user ? `${user.firstName} ${user.lastName}` : 'A user';

    for (const admin of admins) {
      await this.sendCommunication(
        admin,
        'Protection Plan Claim Submitted',
        `User ${userName} has submitted a protection plan claim for booking #${booking.bookingHash || booking._id.toString().slice(-8).toUpperCase()}. Please review immediately.`,
        'warning',
        { type: 'claim_request', bookingId: booking._id.toString(), url: '/admin/claims' }
      );
    }

    return booking;
  }

  async debugClaims() {
    const all = await this.bookingModel.find().lean().exec();
    const withClaims = all.filter(b => b.claimDetails != null);
    return {
      total: all.length,
      withClaims: withClaims.length,
      sampleClaim: withClaims[0] || null,
      allKeysOfFirstBooking: all.length > 0 ? Object.keys(all[0]) : [],
      allClaims: withClaims
    };
  }

  async getAdminClaims() {
    const claims = await this.bookingModel
      .find({ claimDetails: { $exists: true, $ne: null } })
      .populate('carId')
      .populate({ path: 'customerId', select: 'firstName lastName email phoneNumber avatar' })
      .populate({ path: 'vendorId', select: 'firstName lastName email phoneNumber avatar' })
      .sort({ 'claimDetails.submittedAt': -1 })
      .exec();
    console.log('Found claims:', claims.length);
    if (claims.length === 0) {
      // Just check if any booking has claimDetails
      const all = await this.bookingModel.find().lean().exec();
      const withClaims = all.filter(b => b.claimDetails);
      console.log('Bookings with claimDetails in memory:', withClaims.length);
    }
    return claims;
  }

  async updateClaimStatus(bookingId: string, adminId: string, status: string, notes?: string) {
    const booking = await this.bookingModel.findById(bookingId).populate('carId');
    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.claimDetails) throw new BadRequestException('No claim found for this booking');

    booking.claimDetails = {
      ...booking.claimDetails,
      status: status,
      adminNotes: notes,
      resolvedAt: new Date()
    };
    
    await booking.save();

    const customer = await this.userModel.findById(booking.customerId);
    const vendor = await this.userModel.findById(booking.vendorId);
    
    const message = `The protection plan claim for ${(booking.carId as any)?.name} has been ${status.toLowerCase()}.`;

    if (customer) {
        await this.sendCommunication(customer, `Claim ${status}`, message, status === 'Approved' ? 'success' : 'error', { type: 'claim_update', bookingId: booking._id.toString() });
    }
    if (vendor) {
        await this.sendCommunication(vendor, `Claim ${status}`, message, status === 'Approved' ? 'success' : 'error', { type: 'claim_update', bookingId: booking._id.toString() });
    }

    return booking;
  }
}
