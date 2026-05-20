import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Brand } from '../../brands/schemas/brand.schema';
import { Currency } from '../../currencies/schemas/currency.schema';

export type CarDocument = Car & Document;

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, unique: true, sparse: true })
  permalink: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
  brand: Brand;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  vendor: Types.ObjectId;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true, default: 'Day' })
  rentalType: string;

  @Prop({ required: true })
  pricePerDay: number;

  @Prop({
    type: [
      {
        days: { type: Number, required: true },
        pricePerDay: { type: Number, required: true },
        discountPercentage: { type: Number, required: false, default: 0 },
      },
    ],
    default: [],
  })
  priceTiers: { days: number; pricePerDay: number; discountPercentage?: number }[];

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ default: true })
  available: boolean;

  @Prop({ default: 'Available' })
  availabilityStatus: string;

  @Prop()
  description: string;

  @Prop()
  content: string;

  @Prop({ type: Object })
  location: {
    country: string;
    state: string;
    city: string;
    address: string;
    latitude?: number;
    longitude?: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'CarType', required: true })
  vehicleType: Types.ObjectId;

  @Prop()
  transmission: string;

  @Prop()
  fuelType: string;

  @Prop()
  fuelEfficiency: string;

  @Prop()
  licensePlate: string;

  @Prop()
  vin: string;

  @Prop()
  mileage: number;

  @Prop()
  horsepower: number;

  @Prop()
  seats: number;

  @Prop()
  doors: number;

  @Prop()
  driveType: string;

  @Prop()
  cylinders: number;

  @Prop()
  insuranceInfo: string;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ default: 'Brand New' })
  condition: string;

  @Prop()
  color: string;

  @Prop()
  acceleration: number;

  @Prop()
  chargingType: string;

  @Prop()
  batteryCapacity: number;

  @Prop()
  range: number;

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: [String] })
  amenities: string[];

  @Prop({ type: [String] })
  colors: string[];

  @Prop({
    required: true,
    default: 'Instant',
    enum: ['Instant', 'Inquiry', 'Request'],
  })
  bookingType: string;

  @Prop({ type: [Object], default: [] })
  pickupLocations: {
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    price: number;
  }[];

  @Prop({ type: [Object], default: [] })
  extras: {
    name: string;
    description?: string;
    price: number;
    priceType: 'per_day' | 'per_trip';
    category?: string;
  }[];

  @Prop({ default: true })
  requireSecurityDeposit: boolean;

  @Prop({ default: 500 })
  securityDeposit: number;

  @Prop({ required: false, default: 200 })
  distanceIncluded: number;

  @Prop({ required: false, default: 0.50 })
  extraDistanceFee: number;

  @Prop({ type: Types.ObjectId, ref: 'Currency', required: false })
  currency: Types.ObjectId;

  @Prop({ required: false, default: 1 })
  minBookingDays: number;

  @Prop({
    type: [
      {
        name: { type: String, required: true },
        url: { type: String, required: true },
        type: { type: String, required: true }, // e.g. 'RC', 'Insurance'
        expiryDate: { type: Date, required: false },
      },
    ],
    default: [],
  })
  documents: { name: string; url: string; type: string; expiryDate?: Date }[];
  
  @Prop({ type: Object, default: {} })
  customSpecs: Record<string, any>;

  @Prop({
    required: true,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  status: string;
}

export const CarSchema = SchemaFactory.createForClass(Car);
