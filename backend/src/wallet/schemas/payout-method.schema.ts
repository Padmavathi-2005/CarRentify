import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PayoutMethodDocument = PayoutMethod & Document;

@Schema({ timestamps: true })
export class PayoutMethod {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  user: Types.ObjectId;

  @Prop({ required: true })
  bankName: string;

  @Prop({ required: true })
  accountName: string;

  @Prop({ required: true })
  accountNumber: string;

  @Prop({ required: true })
  ifscCode: string;

  @Prop({ default: false })
  isVerified: boolean;
}

export const PayoutMethodSchema = SchemaFactory.createForClass(PayoutMethod);
