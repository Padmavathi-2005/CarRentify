import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PaymentGatewayDocument = PaymentGateway & Document;

@Schema({ timestamps: true })
export class PaymentGateway {
  @Prop({ required: true })
  name: string; // e.g., 'PayPal', 'Stripe'

  @Prop({ required: true })
  slug: string; // e.g., 'paypal'

  @Prop()
  clientId: string;

  @Prop()
  clientSecret: string;

  @Prop({ default: true })
  isTestMode: boolean;

  @Prop({ default: false })
  isEnabled: boolean;

  @Prop()
  description: string;

  @Prop()
  webhookSecret: string;

  @Prop({ default: 0 })
  order: number;
}

export const PaymentGatewaySchema = SchemaFactory.createForClass(PaymentGateway);
