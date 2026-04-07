import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimezoneDocument = Timezone & Document;

@Schema({ timestamps: true })
export class Timezone {
  @Prop({ required: true, unique: true })
  value: string;

  @Prop({ required: true })
  label: string;

  @Prop({ required: true })
  offsetInfo: string;

  @Prop({ default: true })
  isActive: boolean;
}

export const TimezoneSchema = SchemaFactory.createForClass(Timezone);
