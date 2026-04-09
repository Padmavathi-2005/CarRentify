import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true, strict: false, collection: 'settings' })
export class Setting {
  @Prop({ required: true })
  _id: string; // Used as category: 'general', 'frontend', 'smtp', etc.
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
