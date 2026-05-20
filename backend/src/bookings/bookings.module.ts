import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookingsController } from './bookings.controller';
import { ReportsController } from './reports.controller';
import { BookingsService } from './bookings.service';
import { Booking, BookingSchema } from './schemas/booking.schema';
import { Car, CarSchema } from '../cars/schemas/car.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';

import { Setting, SettingSchema } from '../settings/schemas/setting.schema';
import { ReportSchema } from './schemas/report.schema';
import { Verification, VerificationSchema } from '../verification/schemas/verification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Booking.name, schema: BookingSchema },
      { name: Car.name, schema: CarSchema },
      { name: User.name, schema: UserSchema },
      { name: Setting.name, schema: SettingSchema },
      { name: 'Report', schema: ReportSchema },
      { name: Verification.name, schema: VerificationSchema },
    ]),
    NotificationsModule,
  ],
  controllers: [BookingsController, ReportsController],
  providers: [BookingsService],
  exports: [BookingsService],
})
export class BookingsModule {}
