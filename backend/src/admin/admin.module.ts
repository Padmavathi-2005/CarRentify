import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './controllers/admin.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { AnalyticsController } from './controllers/analytics.controller';
import { AdminService } from './services/admin.service';
import { DashboardService } from './services/dashboard.service';
import { AnalyticsService } from './services/analytics.service';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Booking, BookingSchema } from '../bookings/schemas/booking.schema';
import { Car, CarSchema } from '../cars/schemas/car.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Booking.name, schema: BookingSchema },
      { name: Car.name, schema: CarSchema },
    ]),
  ],
  controllers: [AdminController, DashboardController, AnalyticsController],
  providers: [AdminService, DashboardService, AnalyticsService],
})
export class AdminModule {}
