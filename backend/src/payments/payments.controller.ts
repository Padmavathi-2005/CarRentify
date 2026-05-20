import { Controller, Post, Body, Param, UseGuards, Request, Headers } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-session/:bookingId')
  async createSession(
    @Param('bookingId') bookingId: string,
    @Body('type') type?: string,
    @Body('paymentMethod') paymentMethod?: string
  ) {
    return this.paymentsService.createCheckoutSession(bookingId, type, paymentMethod);
  }

  @Post('webhook')
  async webhook(
    @Headers('stripe-signature') sig: string,
    @Request() req: RawBodyRequest<any>,
  ) {
    return this.paymentsService.handleWebhook(sig, req.rawBody);
  }

  @UseGuards(JwtAuthGuard)
  @Post('capture-paypal/:orderId')
  async capturePayPal(
    @Param('orderId') orderId: string,
    @Body('bookingId') bookingId: string,
    @Body('type') type?: string
  ) {
    return this.paymentsService.capturePayPalOrder(orderId, bookingId, type);
  }

  @UseGuards(JwtAuthGuard)
  @Post('finalize-stripe/:sessionId')
  async finalizeStripe(
    @Param('sessionId') sessionId: string,
    @Body('bookingId') bookingId: string,
    @Body('type') type?: string,
  ) {
    return this.paymentsService.finalizeStripeSettlement(sessionId, bookingId, type);
  }
}
