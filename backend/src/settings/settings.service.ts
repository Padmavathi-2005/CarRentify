import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';
import { Currency, CurrencyDocument } from './schemas/currency.schema';
import { Language, LanguageDocument } from './schemas/language.schema';
import { Timezone, TimezoneDocument } from './schemas/timezone.schema';
import { PaymentGateway, PaymentGatewayDocument } from './schemas/payment-gateway.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
    @InjectModel(Currency.name) private currencyModel: Model<CurrencyDocument>,
    @InjectModel(Language.name) private languageModel: Model<LanguageDocument>,
    @InjectModel(Timezone.name) private timezoneModel: Model<TimezoneDocument>,
    @InjectModel(PaymentGateway.name) private paymentGatewayModel: Model<PaymentGatewayDocument>,
  ) {}

  private readonly defaultSections = {
    general: {
      primaryColor: '#3f147b',
      secondaryColor: '#291249',
      siteName: 'CarRental',
      siteUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      favicon: '/favicon.ico',
      logoDark: '/logo.png',
      logoLight: '/logo.png',
      defaultLanguage: 'en',
      defaultCurrency: 'USD',
      defaultTimezone: 'America/New_York',
      email: 'sangvish21@gmail.com',
      phone: '+1 555-0000',
      copyright: '© 2026 CarRental. All rights reserved.',
      isAdminPanelEnabled: true,
      theme: 'light',
      officeLocations: [],
    },
    social: { socialLinks: [] },
    smtp: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      smtpUser: 'support@migrateshop.com',
      smtpPassword: 'zafnjwcikuuzmfgf',
      smtpFrom: 'support@migrateshop.com',
      emailVerificationEnabled: true,
    },
    financials: { walletBalance: 0, minWithdrawalAmount: 50, commissionRate: 15 },
    listings: { maxImagesPerListing: 5, carsPerPage: 12, customFields: [] },
    protection: { plans: [] },
    taxes: { taxes: { items: [] } },
    cancellation: { rules: [], defaultRefundPercentage: 0, isCancellationEnabled: true },
    verification: { 
      fields: [
        { id: 'driving_license_front', name: 'Driver License (Front)', type: 'image', required: true, description: 'Upload the front of your driver license' },
        { id: 'driving_license_back', name: 'Driver License (Back)', type: 'image', required: true, description: 'Upload the back of your driver license' },
        { id: 'driverLicense', name: 'Driver License Number', type: 'text', required: true, description: 'Enter your driver license number' },
        { id: 'licenseExpiryDate', name: 'License Expiry Date', type: 'date', required: true, description: 'Enter the expiration date printed on your driver\'s license' }
      ],
      checkInFields: [
        { id: 'photos', name: 'Car Condition Photos', type: 'images', required: true, description: 'Upload exterior and interior photos (Minimum 2)' },
        { id: 'damagePhotos', name: 'Damage Photos', type: 'images', required: false, description: 'Upload photos of any existing damage (optional)' },
        { id: 'mileage', name: 'Odometer Reading (KM)', type: 'number', required: true, description: 'Current mileage on the car' },
        { id: 'fuelLevel', name: 'Fuel Level (%)', type: 'number', required: true, description: 'Fuel level from 0 to 100' },
        { id: 'notes', name: 'General Notes', type: 'text', required: false, description: 'Any visible damages or issues?' }
      ],
      checkOutFields: [
        { id: 'photos', name: 'Car Condition Photos', type: 'images', required: true, description: 'Upload exterior and interior photos (Minimum 2)' },
        { id: 'damagePhotos', name: 'Damage Photos', type: 'images', required: false, description: 'Upload photos of any existing damage (optional)' },
        { id: 'mileage', name: 'Odometer Reading (KM)', type: 'number', required: true, description: 'Current mileage on the car' },
        { id: 'fuelLevel', name: 'Fuel Level (%)', type: 'number', required: true, description: 'Fuel level from 0 to 100' },
        { id: 'notes', name: 'General Notes', type: 'text', required: false, description: 'Any visible damages or issues?' }
      ]
    },
    frontend: {
      heroTranslations: {
        en: { 
          title: 'Your Ride Should Match the Road!', 
          subtitle: 'Experience elite performance and unmatched prestige.',
          onlineBooking: 'Premium Reservation',
          premiumCarsLabel: 'Elite Vehicles',
          locationsLabel: 'Global Hubs',
          happyClientsLabel: 'Elite Members',
          brandsTitle: 'Plan your trip',
          brandsSubtitle: 'Explore Our Brands',
          brandsDescription: 'Select your perfect ride from our diverse fleet of premium automotive partners.'
        }
      },
      heroImageUrl: '/hero-car-new.png',
      headerNavLinks: [],
      showHeroSection: true,
      showFeaturedCars: true,
      showTestimonials: true,
      showBrandsSection: true,
      showDestinationsSection: true,
      showCTASection: true,
      showLocationsSection: true,
      showEnhanceSection: true,
      showAppSection: true,
      stats: {
        premiumCars: '500+',
        locations: '50+',
        happyClients: '10k+'
      }
    },
    footer: {
      footerLinks: [
        { id: 'f1', label: 'About Us', url: '/about' },
        { id: 'f2', label: 'Terms', url: '/terms' },
        { id: 'f3', label: 'Privacy', url: '/privacy' }
      ]
    },
    ai: {
      openAiApiKey: ''
    }
  };

  async onModuleInit() {
    try {
      // Seed meta-data collections
      const enLang = await this.languageModel.findOne({ code: 'en' });
      if (!enLang) {
        await this.languageModel.create({ code: 'en', name: 'English', nativeName: 'English', direction: 'ltr', isActive: true });
      }

      const usdCurr = await this.currencyModel.findOne({ code: 'USD' });
      if (!usdCurr) {
        await this.currencyModel.create({ code: 'USD', name: 'US Dollar', symbol: '$', symbolPosition: 'left', exchangeRate: 1, isActive: true });
      }

      // Sync sections with DB
      for (const [key, defaults] of Object.entries(this.defaultSections)) {
        const exists = await this.settingModel.findById(key);
        if (!exists) {
          await this.settingModel.create({ _id: key, ...defaults });
        }
      }
    } catch (err) {
      console.warn('Settings initialization skipped or failed:', err.message);
    }
  }

  async getCurrencies() {
    return this.currencyModel.find({ isActive: true });
  }
  async getLanguages() {
    return this.languageModel.find({ isActive: true });
  }
  async getTimezones() {
    return this.timezoneModel.find({ isActive: true });
  }

  async getSettings(): Promise<any> {
    try {
      const docs = await this.settingModel.find().lean();
      
      // Merge defaults with DB results
      const dbSettings = docs.reduce((merged, doc: any) => {
        const { _id, __v, createdAt, updatedAt, ...fields } = doc;
        return { ...merged, ...fields };
      }, {});

      // Flatten defaults for base object
      const flattenedDefaults = Object.values(this.defaultSections).reduce((acc, val) => ({ ...acc, ...val }), { ...this.defaultSections.general });

      const finalSettings = { ...flattenedDefaults, ...dbSettings };
      
      // Obscure sensitive keys from the public response
      if (finalSettings.openAiApiKey) {
        finalSettings.openAiApiKey = '********';
      }

      return finalSettings;
    } catch (err) {
      console.error('getSettings() failed, returning defaults:', err);
      return Object.values(this.defaultSections).reduce((acc, val) => ({ ...acc, ...val }), { ...this.defaultSections.general });
    }
  }

  async updateSettings(updateDto: Partial<any>) {
    try {
      // Flatten any nested section objects (e.g. { ai: { openAiApiKey: 'x' } } → { openAiApiKey: 'x' })
      const flatDto: any = {};
      for (const [key, value] of Object.entries(updateDto)) {
        if (value !== null && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
          // Check if this key matches a known section name — if so, flatten its children
          if (this.defaultSections[key as keyof typeof this.defaultSections]) {
            Object.assign(flatDto, value);
          } else {
            flatDto[key] = value;
          }
        } else {
          flatDto[key] = value;
        }
      }

      for (const [sectionId, fields] of Object.entries(this.defaultSections)) {
        const sectionUpdate: any = {};
        const fieldsToUnset: any = {};
        
        // 1. Identify fields to update/set
        Object.keys(fields).forEach((field) => {
          if (flatDto[field] !== undefined) {
            // Prevent overwriting with obscured values
            if (field === 'openAiApiKey' && flatDto[field] === '********') {
              return; // Skip updating this field
            }
            sectionUpdate[field] = flatDto[field];
          }
        });

        // 2. Identify unwanted fields to PURGE from DB
        try {
          const currentDoc = await this.settingModel.findById(sectionId).lean();
          if (currentDoc) {
            // Keep system fields and allowed section fields
            const allowedKeys = new Set([...Object.keys(fields), '_id', '__v', 'createdAt', 'updatedAt', 'id']);
            Object.keys(currentDoc).forEach(key => {
              if (!allowedKeys.has(key)) {
                fieldsToUnset[key] = "";
              }
            });
          }
        } catch (dbErr) {
          console.warn(`Purge check failed for section ${sectionId}:`, dbErr.message);
        }

        if (Object.keys(sectionUpdate).length > 0 || Object.keys(fieldsToUnset).length > 0) {
          const updateOp: any = {};
          if (Object.keys(sectionUpdate).length > 0) updateOp.$set = sectionUpdate;
          if (Object.keys(fieldsToUnset).length > 0) updateOp.$unset = fieldsToUnset;

          await this.settingModel.findOneAndUpdate(
            { _id: sectionId },
            updateOp,
            { upsert: true, returnDocument: 'after' },
          );
        }
      }
    } catch (err) {
      console.error('updateSettings() critical failure:', err);
      throw err; // Rethrow to let the controller handle it properly
    }
    return this.getSettings();
  }

  async getPrimaryColor() {
    try {
      const doc = await this.settingModel.findById('general').lean();
      return (doc as any)?.primaryColor || '#3f147b';
    } catch {
      return '#3f147b';
    }
  }

  async getAiApiKey() {
    try {
      const doc = await this.settingModel.findById('ai').lean();
      return (doc as any)?.openAiApiKey || '';
    } catch {
      return '';
    }
  }

  // --- Payment Gateway Methods ---
  async getPaymentGateways() {
    return this.paymentGatewayModel.find().exec();
  }

  async updatePaymentGateway(id: string, updateData: any) {
    return this.paymentGatewayModel.findByIdAndUpdate(id, updateData, { returnDocument: 'after' }).exec();
  }

  async deletePaymentGateway(id: string) {
    return this.paymentGatewayModel.findByIdAndDelete(id).exec();
  }

  async createPaymentGateway(data: any) {
    return this.paymentGatewayModel.create(data);
  }
}
