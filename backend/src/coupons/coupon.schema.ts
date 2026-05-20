import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CouponDocument = Coupon & Document;

@Schema({ timestamps: true })
export class Coupon {
  @Prop({ required: true, unique: true, uppercase: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true, enum: ['amount', 'percentage'], default: 'amount' })
  discountType: string;

  @Prop()
  endDate: Date;

  @Prop({ enum: ['publish', 'draft'], default: 'publish' })
  status: string;

  @Prop({ default: 0 })
  minSpend: number;

  @Prop({ default: 0 })
  maxSpend: number;

  @Prop({ default: 0 }) // 0 for unlimited
  usageLimit: number;

  @Prop({ default: 0 }) // 0 for unlimited
  userLimit: number;

  @Prop({ default: 0 })
  usedCount: number;

  @Prop([String])
  onlyForServices: string[]; // Car IDs or Car Type IDs

  @Prop([String])
  onlyForUsers: string[]; // User IDs
}

export const CouponSchema = SchemaFactory.createForClass(Coupon);
