import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { Setting, SettingSchema } from './schemas/setting.schema';
import { Currency, CurrencySchema } from './schemas/currency.schema';
import { Language, LanguageSchema } from './schemas/language.schema';
import { Timezone, TimezoneSchema } from './schemas/timezone.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Setting.name, schema: SettingSchema },
      { name: Currency.name, schema: CurrencySchema },
      { name: Language.name, schema: LanguageSchema },
      { name: Timezone.name, schema: TimezoneSchema }
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
