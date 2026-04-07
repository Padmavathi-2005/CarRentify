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
    try {
      const fullDefaults = {
        primaryColor: '#3f147b',
        secondaryColor: '#291249',
        siteName: 'CarRentify',
        siteUrl: 'https://carrentify.com',
        favicon: '/favicon.ico',
        logoDark: '/logo.png',
        logoLight: '/logo.png',
        isAdminPanelEnabled: true,
        heroTitle: 'Drive the Future of Elegance.',
        heroSubtitle: 'Velocity Blue curates an elite fleet of vehicles for those who demand performance and prestige in every journey.',
        heroImageUrl: '/hero-car-new.png',
        smtpHost: 'smtp.gmail.com',
        smtpPort: '587',
        smtpUser: 'varsha.vasu282003@gmail.com',
        smtpPassword: '',
        smtpFrom: 'varsha.vasu282003@gmail.com',
        defaultLanguage: 'en',
        defaultCurrency: 'USD',
        defaultTimezone: 'America/New_York',
        email: 'varsha.vasu282003@gmail.com',
        phone: '+1 555-0000',
        copyright: '© 2026 CarRentify. All rights reserved.',
        facebook: 'https://facebook.com/carrentify',
        instagram: 'https://instagram.com/carrentify',
        linkedin: 'https://linkedin.com/company/carrentify',
        twitter: 'https://twitter.com/carrentify',
        emailVerificationEnabled: true,
        walletBalance: 0,
        minWithdrawalAmount: 50,
        commissionRate: 15,
      };

      // Ensure at least one settings document exists
      const exists = await this.settingModel.findOne();
      if (!exists) {
        await this.settingModel.create(fullDefaults);
      } else {
        // Force sync all missing fields to existing record
        await this.settingModel.findOneAndUpdate(
          {},
          { $set: fullDefaults },
          { returnDocument: 'after', upsert: true }
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
    } catch (err) {
      console.warn('Settings Database connection failed at startup. Server will run with local defaults.');
    }
  }

  async getCurrencies() { return this.currencyModel.find({ isActive: true }); }
  async getLanguages() { return this.languageModel.find({ isActive: true }); }
  async getTimezones() { return this.timezoneModel.find({ isActive: true }); }

  async getSettings() {
    return this.settingModel.findOne();
  }

  async updateSettings(updateDto: Partial<Setting>) {
    return this.settingModel.findOneAndUpdate({}, updateDto, { returnDocument: 'after' });
  }

  async getPrimaryColor() {
    const settings = await this.getSettings();
    return settings?.primaryColor || '#3f147b';
  }
}
