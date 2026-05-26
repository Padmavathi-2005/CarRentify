import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { Wallet, WalletSchema } from './schemas/wallet.schema';
import { Transaction, TransactionSchema } from './schemas/transaction.schema';
import { SettingsModule } from '../settings/settings.module';
import { PaymentGateway, PaymentGatewaySchema } from '../settings/schemas/payment-gateway.schema';
import { PayoutMethod, PayoutMethodSchema } from './schemas/payout-method.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { User, UserSchema } from '../users/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Wallet.name, schema: WalletSchema },
      { name: Transaction.name, schema: TransactionSchema },
      { name: PaymentGateway.name, schema: PaymentGatewaySchema },
      { name: PayoutMethod.name, schema: PayoutMethodSchema },
      { name: User.name, schema: UserSchema },
    ]),
    SettingsModule,
    NotificationsModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
