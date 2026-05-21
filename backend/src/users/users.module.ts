import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User, UserSchema } from './schemas/user.schema';
import { CarsModule } from '../cars/cars.module';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { ScheduleModule } from '@nestjs/schedule';
import { UsersCleanupService } from './users-cleanup.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { LicenseCronService } from './license-cron.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema }
    ]),
    CarsModule, // To populate car details in wishlist
    ScheduleModule.forRoot(),
    NotificationsModule,
  ],
  providers: [UsersService, UsersCleanupService, LicenseCronService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
