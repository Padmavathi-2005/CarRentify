import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type LanguageDocument = Language & Document;

@Schema({ timestamps: true })
export class Language {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nativeName: string;

  @Prop({ default: 'ltr', enum: ['ltr', 'rtl'] })
  direction: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
