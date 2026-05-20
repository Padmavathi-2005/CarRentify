import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReportDocument = Report & Document;

@Schema({ timestamps: true })
export class Report {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reporterId: Types.ObjectId; // Customer

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedId: Types.ObjectId; // Host

  @Prop({ type: Types.ObjectId, ref: 'Booking', required: true })
  bookingId: Types.ObjectId;

  @Prop({ required: true })
  reason: string;

  @Prop()
  details: string;

  @Prop({ default: 'Pending' })
  status: string; // Pending, Resolved, Dismissed
}

export const ReportSchema = SchemaFactory.createForClass(Report);
