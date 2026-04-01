import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CarDocument = Car & Document;

@Schema({ timestamps: true })
export class Car {
  @Prop({ required: true })
  brand: string;

  @Prop({ required: true })
  model: string;

  @Prop({ required: true })
  year: number;

  @Prop({ required: true })
  pricePerDay: number;

  @Prop({ required: true })
  image: string; // URL for car image

  @Prop({ default: true })
  available: boolean;

  @Prop()
  description: string;

  @Prop()
  features: string[];
}

export const CarSchema = SchemaFactory.createForClass(Car);
