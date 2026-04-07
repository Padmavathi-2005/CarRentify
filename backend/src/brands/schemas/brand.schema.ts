import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  logo: string; // URL to brand logo icon

  @Prop({ default: true })
  isActive: boolean;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);
