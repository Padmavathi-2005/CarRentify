import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Brand } from '../../brands/schemas/brand.schema';

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false, unique: true, sparse: true })
  permalink: string;

  @Prop({ type: Types.ObjectId, ref: 'Brand', required: false })
  brand: Brand;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  vendor: Types.ObjectId;

  @Prop({ required: true, enum: ['Men', 'Women', 'Kids', 'Unisex'] })
  category: string;

  @Prop({ required: true })
  subCategory: string; // e.g., 'Dresses', 'Shirts', 'Pants'

  @Prop({ required: true })
  price: number;

  @Prop({ required: false })
  discountPrice: number;

  @Prop({ type: [String], required: true })
  images: string[];

  @Prop({ default: true })
  available: boolean;

  @Prop()
  description: string;

  @Prop()
  materials: string; // e.g., "100% Cotton"

  @Prop()
  careInstructions: string; // e.g., "Machine wash cold"

  @Prop({
    type: [
      {
        size: { type: String, required: true },
        color: { type: String, required: true },
        stockQuantity: { type: Number, required: true, default: 0 },
        sku: { type: String, required: false },
      },
    ],
    default: [],
  })
  variants: { size: string; color: string; stockQuantity: number; sku?: string }[];

  @Prop({ type: [String] })
  tags: string[];

  // Performance & Marketplace metrics
  @Prop({ default: 0 })
  averageRating: number;

  @Prop({ default: 0 })
  reviewCount: number;

  @Prop({ default: 0 })
  totalSales: number;

  @Prop({
    required: false,
    enum: ['Flexible', 'Moderate', 'Strict'],
    default: 'Flexible'
  })
  returnPolicy: string;

  @Prop({ type: [{ question: String, answer: String }], default: [] })
  faqs: { question: string; answer: string }[];

  @Prop({ default: false })
  isFeatured: boolean;

  @Prop({
    required: true,
    default: 'pending',
    enum: ['pending', 'approved', 'rejected'],
  })
  status: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);
