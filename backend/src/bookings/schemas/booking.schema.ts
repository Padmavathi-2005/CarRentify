import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BookingDocument = Booking & Document;

export enum BookingStatus {
  PENDING = 'Pending', // Request to Book - waiting for vendor
  AWAITING_PAYMENT = 'Awaiting Payment', // Created but online payment not yet verified
  CONFIRMED = 'Confirmed', // Instant Book or Vendor Approved
  ACTIVE = 'Active', // Trip is currently ongoing
  REJECTED = 'Rejected', // Vendor Rejected
  CANCELLED = 'Cancelled', // Customer or System Cancelled
  COMPLETED = 'Completed', // Trip finished
}

@Schema({ timestamps: true })
export class Booking {
  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  carId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  customerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  vendorId: Types.ObjectId;

  @Prop({ required: true })
  startDate: string;

  @Prop({ required: true })
  endDate: string;

  @Prop({ required: true })
  pickupTime: string;

  @Prop({ required: true })
  returnTime: string;

  @Prop({ required: true })
  totalPrice: number;

  // Base amount before platform commission and deposit (rental + extras).
  // This lets us compute/administer commission consistently server-side.
  @Prop()
  baseAmount?: number;

  // Platform commission amount applied to this booking.
  @Prop()
  platformFee?: number;

  @Prop()
  taxesTotal?: number;

  @Prop()
  protectionCost?: number;

  @Prop()
  couponDiscount?: number;

  // Commission rate (%) used to compute platformFee at time of booking.
  @Prop()
  commissionRateApplied?: number;

  // Optional refundable deposit amount charged at checkout, if your flow uses it.
  @Prop()
  securityDeposit?: number;

  @Prop({
    type: String,
    enum: BookingStatus,
    default: BookingStatus.PENDING,
  })
  status: BookingStatus;

  @Prop({
    type: String,
    enum: ['Instant', 'Request'],
    required: true,
  })
  bookingType: string;

  @Prop()
  paymentId: string; // If using external payment like Stripe

  @Prop()
  paymentMethod?: string;

  @Prop({ default: false })
  isRefunded: boolean;

  @Prop({ default: false })
  isCommissionProcessed: boolean;

  @Prop()
  protectionPlanId?: string;

  @Prop()
  couponId?: string;

  @Prop()
  message?: string;

  // Added for Pickup/Return alerts & verification
  @Prop({ default: false })
  pickupAlert24hSent: boolean;

  @Prop({ default: false })
  pickupAlert5hSent: boolean;

  @Prop({ default: false })
  lateReturnAlertSent: boolean;

  @Prop()
  hostMileage?: number;

  @Prop()
  hostConditionImage?: string;

  @Prop({ default: false })
  customerAcceptedCondition: boolean;

  @Prop()
  lateReturnResponse?: string;

  @Prop({ default: false })
  delayRequested: boolean;

  @Prop()
  delayReason?: string;

  @Prop({ default: false })
  nextBookingHandled: boolean;

  @Prop()
  returnMileage?: number;

  @Prop()
  returnConditionImage?: string;

  @Prop({ default: false })
  customerAcceptedReturn: boolean;

  @Prop()
  settlementAmount?: number;

  @Prop({ default: 0 })
  extensionCharge?: number;

  @Prop({ default: false })
  isSettled: boolean;

  @Prop({ default: 0 })
  handoverRejectionCount: number;

  @Prop({ unique: true })
  bookingHash: string;

  // --- TRIP LIFECYCLE FIELDS ---
  @Prop({ type: [String], default: [] })
  checkInPhotos: string[];

  @Prop()
  checkInMileage?: number;

  @Prop()
  checkInFuelLevel?: number; // 0 to 100

  @Prop()
  checkInNotes?: string;

  @Prop()
  checkInHostSignature?: string;

  @Prop()
  checkInRenterSignature?: string;

  @Prop({ type: Object })
  checkInDetails?: Record<string, any>;

  @Prop({ type: [String], default: [] })
  checkOutPhotos: string[];

  @Prop()
  checkOutMileage?: number;

  @Prop()
  checkOutFuelLevel?: number;

  @Prop()
  checkOutNotes?: string;

  @Prop()
  checkOutHostSignature?: string;

  @Prop()
  checkOutRenterSignature?: string;

  @Prop({ type: Object })
  checkOutDetails?: Record<string, any>;

  @Prop({ type: Object })
  extraCharges?: {
    hasIssue: boolean;
    issueDetails?: string;
    chargeAmount?: number;
    proofImages?: string[];
    billImage?: string;
  };

  // --- AGREEMENT FIELDS ---
  @Prop({ type: Object })
  renterAgreementSignature?: {
    acceptedAt: Date;
    ipAddress: string;
    userAgent: string;
    signatureBase64?: string;
  };

  @Prop({ type: Object })
  hostAgreementSignature?: {
    acceptedAt: Date;
    ipAddress: string;
    userAgent: string;
    signatureBase64?: string;
  };

  @Prop()
  agreementText?: string;

  @Prop()
  agreementHash?: string;

  @Prop()
  renterLegalName?: string;

  @Prop()
  hostLegalName?: string;

  @Prop()
  agreementVersion?: string;

  @Prop()
  agreementGeneratedAt?: Date;

  @Prop({
    type: String,
    enum: ['not_started', 'host_submitted_check_in', 'checked_in', 'host_submitted_check_out', 'checked_out'],
    default: 'not_started'
  })
  tripStatus: string;

  @Prop({ type: Object })
  deliveryDetails?: {
    type: 'host' | 'predefined' | 'custom';
    address: string;
    latitude?: number;
    longitude?: number;
    fee: number;
    distance?: number;
  };

  // --- CLAIM DETAILS ---
  @Prop({ type: Object })
  claimDetails?: {
    description: string;
    dateOfIncident: Date;
    photos: string[];
    status: string; // e.g. Pending, Approved, Rejected
    submittedAt: Date;
    adminNotes?: string;
    resolvedAt?: Date;
  };
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
