import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true })
export class Setting {
  @Prop({ default: '#17094a' })
  primaryColor: string;

  @Prop({ default: 'CarRentify' })
  siteName: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: true })
  isAdminPanelEnabled: boolean;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
