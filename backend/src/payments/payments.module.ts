import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { PaymentGateway, PaymentGatewaySchema } from '../settings/schemas/payment-gateway.schema';
import { Setting, SettingSchema } from '../settings/schemas/setting.schema';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: PaymentGateway.name, schema: PaymentGatewaySchema },
      { name: Setting.name, schema: SettingSchema },
    ]),
    BookingsModule,
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
