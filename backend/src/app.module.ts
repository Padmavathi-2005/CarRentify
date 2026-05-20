import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CarsModule } from './cars/cars.module';
import { AdminModule } from './admin/admin.module';
import { SettingsModule } from './settings/settings.module';
import { AuthModule } from './auth/auth.module';
import { BrandsModule } from './brands/brands.module';
import { PagesModule } from './pages/pages.module';
import { CurrenciesModule } from './currencies/currencies.module';
import { LanguagesModule } from './languages/languages.module';
import { UsersModule } from './users/users.module';
import { ReviewsModule } from './reviews/reviews.module';
import { NewsletterModule } from './newsletter/newsletter.module';
import { CarTypesModule } from './car-types/car-types.module';
import { MediaModule } from './media/media.module';
import { AmenitiesModule } from './amenities/amenities.module';
import { BookingsModule } from './bookings/bookings.module';
import { NotificationsModule } from './notifications/notifications.module';
import { DestinationsModule } from './destinations/destinations.module';
import { PaymentsModule } from './payments/payments.module';
import { ChatModule } from './chat/chat.module';
import { CouponsModule } from './coupons/coupons.module';
import { WalletModule } from './wallet/wallet.module';
import { VerificationModule } from './verification/verification.module';
import { BackupModule } from './backup/backup.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/CarRental',
      {
        serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of hanging
        connectTimeoutMS: 10000,
        socketTimeoutMS: 45000,
      }
    ),
    ScheduleModule.forRoot(),
    CarsModule,
    AdminModule,
    SettingsModule,
    AuthModule,
    BrandsModule,
    PagesModule,
    CurrenciesModule,
    LanguagesModule,
    UsersModule,
    ReviewsModule,
    NewsletterModule,
    CarTypesModule,
    MediaModule,
    AmenitiesModule,
    BookingsModule,
    NotificationsModule,
    DestinationsModule,
    PaymentsModule,
    ChatModule,
    CouponsModule,
    WalletModule,
    VerificationModule,
    BackupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
