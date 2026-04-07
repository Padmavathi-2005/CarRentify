import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { Currency, CurrencyDocument } from './schemas/currency.schema';
import { Language, LanguageDocument } from './schemas/language.schema';
import { Timezone, TimezoneDocument } from './schemas/timezone.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
    @InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>,
    @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,
    @InjectModel(Timezone.name) private timezoneModel: Model<TimezoneDocument>,
  ) {}

  async onModuleInit() {
    // Ensure at least one settings document exists
    const exists = await this.settingModel.findOne();
    if (!exists) {
      await this.settingModel.create({
        primaryColor: '#3f147b',
        secondaryColor: '#291249',
        siteName: 'CarRentify',
        siteUrl: 'https://carrentify.com',
        favicon: '/favicon.ico',
        isAdminPanelEnabled: true,
      });
    } else {
      // Ensure all required fields exist for existing records
      await this.settingModel.findOneAndUpdate(
        {},
        {
          $setOnInsert: {
            primaryColor: '#3f147b',
            secondaryColor: '#291249',
            siteName: 'CarRentify',
            siteUrl: 'https://carrentify.com',
            favicon: '/favicon.ico',
            isAdminPanelEnabled: true,
          }
        },
        { upsert: true }
      );
    }

    // Seed Languages
    const langCount = await this.languageModel.countDocuments();
    if (langCount === 0) {
      await this.languageModel.insertMany([
        { code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isActive: true },
        { code: 'es', name: 'Spanish', nativeName: 'Español', direction: 'ltr', isActive: true },
        { code: 'fr', name: 'French', nativeName: 'Français', direction: 'ltr', isActive: true },
        { code: 'ar', name: 'Arabic', nativeName: 'العربية', direction: 'rtl', isActive: true },
        { code: 'zh', name: 'Chinese', nativeName: '中文', direction: 'ltr', isActive: true }
      ]);
    }

    // Seed Currencies
    const currencyCount = await this.currencyModel.countDocuments();
    if (currencyCount === 0) {
      await this.currencyModel.insertMany([
        { code: 'USD', name: 'US Dollar', symbol: '$', symbolPosition: 'left', exchangeRate: 1, isActive: true },
        { code: 'EUR', name: 'Euro', symbol: '€', symbolPosition: 'right', exchangeRate: 0.91, isActive: true },
        { code: 'GBP', name: 'British Pound', symbol: '£', symbolPosition: 'left', exchangeRate: 0.78, isActive: true },
        { code: 'AED', name: 'Emirati Dirham', symbol: 'د.إ', symbolPosition: 'left', exchangeRate: 3.67, isActive: true },
        { code: 'JPY', name: 'Japanese Yen', symbol: '¥', symbolPosition: 'left', exchangeRate: 148.5, isActive: true }
      ]);
    }

    // Seed Timezones
    const tzCount = await this.timezoneModel.countDocuments();
    if (tzCount === 0) {
      await this.timezoneModel.insertMany([
        { value: 'America/New_York', label: '(GMT-05:00) Eastern Time - New York', offsetInfo: '-05:00', isActive: true },
        { value: 'America/Los_Angeles', label: '(GMT-08:00) Pacific Time - Los Angeles', offsetInfo: '-08:00', isActive: true },
        { value: 'Europe/London', label: '(GMT+00:00) Greenwich Mean Time - London', offsetInfo: '+00:00', isActive: true },
        { value: 'Europe/Paris', label: '(GMT+01:00) Central European Time - Paris', offsetInfo: '+01:00', isActive: true },
        { value: 'Asia/Dubai', label: '(GMT+04:00) Gulf Standard Time - Dubai', offsetInfo: '+04:00', isActive: true },
        { value: 'Asia/Tokyo', label: '(GMT+09:00) Japan Standard Time - Tokyo', offsetInfo: '+09:00', isActive: true }
      ]);
    }
  }

  async getCurrencies() { return this.currencyModel.find({ isActive: true }); }
  async getLanguages() { return this.languageModel.find({ isActive: true }); }
  async getTimezones() { return this.timezoneModel.find({ isActive: true }); }

  async getSettings() {
    return this.settingModel.findOne();
  }

  async updateSettings(updateDto: Partial<Setting>) {
    return this.settingModel.findOneAndUpdate({}, updateDto, { new: true });
  }

  async getPrimaryColor() {
    const settings = await this.getSettings();
    return settings?.primaryColor || '#3f147b';
  }
}
