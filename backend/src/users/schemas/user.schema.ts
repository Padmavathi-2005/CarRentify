import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Stored as Bcrypt Hash

  @Prop({ default: 'user' })
  role: 'user' | 'vendor' | 'admin';

  @Prop()
  phone: string;

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
}

export const UserSchema = SchemaFactory.createForClass(User);
