import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ unique: true, sparse: true })
  displayName: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop({ default: false })
  isGoogleVerified: boolean;

  @Prop({ default: false })
  isFacebookVerified: boolean;

  @Prop({ default: false })
  isTwitterVerified: boolean;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Stored as Bcrypt Hash

  @Prop({ default: 'user' })
  role: 'user' | 'admin';

  @Prop()
  phone: string;

  @Prop()
  dob: string; // ISO Date string for Age verification

  @Prop()
  doorNo: string;

  @Prop()
  street: string;

  @Prop()
  city: string;

  @Prop()
  state: string;

  @Prop()
  postalCode: string;

  @Prop()
  address: string;

  @Prop({ type: Number })
  lat: number;

  @Prop({ type: Number })
  lon: number;

  @Prop()
  profileImage: string;

  // --- SECURITY EXTRA FIELDS ---

  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop()
  lockUntil: number; // Timestamp for brute-force lock

  @Prop()
  otpCode: string;

  @Prop()
  otpExpires: number;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop({ type: [String], default: [] })
  wishlist: string[];

  @Prop({ default: 0 })
  walletBalance: number;

  @Prop()
  licenseImage: string;

  @Prop()
  licenseBackImage: string;

  @Prop()
  licenseExpiryDate: Date;

  @Prop({ default: false })
  licenseExpiryNotified: boolean;

  // Granular verification status managed by admin
  @Prop({ enum: ['not_submitted', 'pending', 'approved', 'rejected'], default: 'not_submitted' })
  verificationStatus: string;

  @Prop({ unique: true, sparse: true })
  slug: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  deactivatedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
