import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Car', required: true })
  car: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  booking: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop({ required: true })
  comment: string;

  @Prop({ default: 0, min: 0, max: 5 })
  vehicleCleanliness: number;

  @Prop({ default: 0, min: 0, max: 5 })
  listingAccuracy: number;

  @Prop({ default: 0, min: 0, max: 5 })
  pickupExperience: number;

  @Prop({ default: 0, min: 0, max: 5 })
  hostCommunication: number;

  @Prop({ default: 0, min: 0, max: 5 })
  vehicleLocation: number;

  @Prop({ default: 0, min: 0, max: 5 })
  valueForMoney: number;

  @Prop({ default: false })
  isVerifiedPurchase: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
