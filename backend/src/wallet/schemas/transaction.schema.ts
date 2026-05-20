import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TransactionDocument = Transaction & Document;

export enum TransactionType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum TransactionStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export enum TransactionSource {
  ADMIN = 'admin',
  USER = 'user',
  BOOKING = 'booking',
  REFUND = 'refund',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
}

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Wallet', required: true })
  wallet: Types.ObjectId;

  @Prop({ required: true })
  amount: number;

  @Prop({ type: String, enum: TransactionType, required: true })
  type: TransactionType;

  @Prop({ type: String, enum: TransactionStatus, default: TransactionStatus.SUCCESS })
  status: TransactionStatus;

  @Prop({ type: String, enum: TransactionSource, required: true })
  source: TransactionSource;

  @Prop()
  description: string;

  @Prop()
  referenceId: string; // Booking ID or Stripe Payment ID

  @Prop({ default: 'USD' })
  currency: string;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
