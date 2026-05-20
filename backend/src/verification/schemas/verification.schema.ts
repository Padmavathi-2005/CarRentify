import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VerificationDocument = Verification & Document;

export enum VerificationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Schema({ timestamps: true })
export class Verification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  // Array of { fieldId, fieldName, fieldType, value (URL for images, text for text fields) }
  @Prop({ type: [Object], default: [] })
  documents: {
    fieldId: string;
    fieldName: string;
    fieldType: 'image' | 'text';
    value: string;
  }[];

  @Prop({ enum: VerificationStatus, default: VerificationStatus.PENDING })
  status: VerificationStatus;

  @Prop()
  adminNote?: string;

  @Prop()
  reviewedAt?: Date;
}

export const VerificationSchema = SchemaFactory.createForClass(Verification);
