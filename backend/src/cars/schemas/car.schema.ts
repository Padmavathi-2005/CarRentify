import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Brand } from '../../brands/schemas/brand.schema';

export type CarDocument = Car & Document;

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true })
  name: string;

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

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ default: true })
  available: boolean;

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

  @Prop()
  vehicleType: string;

  @Prop()
  transmission: string;

  @Prop()
  fuelType: string;

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

  @Prop({ type: [String] })
  tags: string[];

  @Prop({ type: [String] })
  amenities: string[];

  @Prop({ type: [String] })
  colors: string[];
}

export const CarSchema = SchemaFactory.createForClass(Car);
