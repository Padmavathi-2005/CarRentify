import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LanguageDocument = HydratedDocument<Language>;

@Schema({ timestamps: true })
export class Language {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  nativeName: string;

  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const LanguageSchema = SchemaFactory.createForClass(Language);
