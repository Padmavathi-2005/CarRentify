import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DestinationDocument = Destination & Document;

@Schema({ timestamps: true })
export class Destination {
  @Prop({ required: true })
  city: string;

  @Prop({ required: true })
  country: string;

  @Prop()
  description: string;

  @Prop()
  image: string; // uploaded image URL path

  @Prop({ default: 0 })
  order: number; // admin-controlled sort order

  @Prop({ default: true })
  isActive: boolean;
}

export const DestinationSchema = SchemaFactory.createForClass(Destination);
