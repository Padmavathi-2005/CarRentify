import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CurrencyDocument = Currency & Document;

@Schema({ timestamps: true })
export class Currency {
  @Prop({ required: true, unique: true })
  code: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  symbol: string;

  @Prop({ default: 'left', enum: ['left', 'right'] })
  symbolPosition: string;

  @Prop({ required: true, default: 1 })
  exchangeRate: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const CurrencySchema = SchemaFactory.createForClass(Currency);
