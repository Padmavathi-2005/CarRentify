import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingDocument = Setting & Document;

@Schema({ timestamps: true })
export class Setting {
  @Prop({ default: '#3f147b' })
  primaryColor: string;

  @Prop({ default: '#291249' })
  secondaryColor: string;

  @Prop({ default: 'CarRentify' })
  siteName: string;

  @Prop({ default: '' })
  logoUrl: string;

  @Prop({ default: true })
  isAdminPanelEnabled: boolean;

  @Prop({ default: 'https://carrentify.com' })
  siteUrl: string;

  @Prop({ default: '/favicon.ico' })
  favicon: string;

  @Prop({ default: 'Drive the Future of Elegance.' })
  heroTitle: string;

  @Prop({ default: 'Velocity Blue curates an elite fleet of vehicles for those who demand performance and prestige in every journey.' })
  heroSubtitle: string;

  @Prop({ default: '/hero-car-new.png' })
  heroImageUrl: string;

  @Prop({ default: '' })
  smtpHost: string;

  @Prop({ default: '' })
  smtpPort: string;

  @Prop({ default: '' })
  smtpUser: string;

  @Prop({ default: '' })
  smtpPassword: string;

  @Prop({ default: '' })
  smtpFrom: string;

  @Prop({ default: 'en' })
  defaultLanguage: string;

  @Prop({ default: 'USD' })
  defaultCurrency: string;

  @Prop({ default: 'America/New_York' })
  defaultTimezone: string;

  @Prop({ default: '' })
  email: string;

  @Prop({ default: '' })
  phone: string;

  @Prop({ default: '' })
  copyright: string;

  @Prop({ default: '' })
  facebook: string;

  @Prop({ default: '' })
  instagram: string;

  @Prop({ default: '' })
  linkedin: string;

  @Prop({ default: '' })
  twitter: string;
}

export const SettingSchema = SchemaFactory.createForClass(Setting);
