import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  displayName: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Stored as Bcrypt Hash

  @Prop({ default: 'user' })
  role: 'user' | 'vendor' | 'admin';

  @Prop()
  phone: string;

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
}

export const UserSchema = SchemaFactory.createForClass(User);
