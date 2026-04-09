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
      // Fetch actual IDs from DB to map correctly in General settings
      const enLang = await this.languageModel.findOne({ code: 'en' });
      const usdCurr = await this.currencyModel.findOne({ code: 'USD' });

      const sections = {
        general: {
          primaryColor: '#3f147b',
          secondaryColor: '#291249',
          siteName: 'CarRentify',
          siteUrl: 'https://carrentify.com',
          favicon: '/favicon.ico',
          logoDark: '/logo.png',
          logoLight: '/logo.png',
          defaultLanguage: enLang ? enLang._id : 'en',
          defaultCurrency: usdCurr ? usdCurr._id : 'USD',
          defaultTimezone: 'America/New_York',
          email: 'varsha.vasu282003@gmail.com',
          phone: '+1 555-0000',
          copyright: '© 2026 CarRentify. All rights reserved.',
          isAdminPanelEnabled: true,
        },
        social: {
          socialLinks: [
            { id: 'facebook', icon: 'https://cdn-icons-png.flaticon.com/512/733/733547.png', url: 'https://facebook.com/carrentify' },
            { id: 'instagram', icon: 'https://cdn-icons-png.flaticon.com/512/2111/2111463.png', url: 'https://instagram.com/carrentify' },
            { id: 'linkedin', icon: 'https://cdn-icons-png.flaticon.com/512/3536/3536505.png', url: 'https://linkedin.com/company/carrentify' },
            { id: 'x', icon: 'https://cdn-icons-png.flaticon.com/512/5969/5969020.png', url: 'https://x.com/carrentify' }
          ]
        },
        smtp: {
          smtpHost: 'smtp.gmail.com',
          smtpPort: '587',
          smtpUser: 'varsha.vasu282003@gmail.com',
          smtpPassword: '',
          smtpFrom: 'varsha.vasu282003@gmail.com',
          emailVerificationEnabled: true,
        },
        financials: {
          walletBalance: 0,
          minWithdrawalAmount: 50,
          commissionRate: 15,
        },
        listings: {
          maxImagesPerListing: 5,
        },
        frontend: {
          heroTranslations: {
            en: {
              title: 'Your Ride Should Match the Road!',
              subtitle: 'Experience elite performance and unmatched prestige with every mile you drive.',
              heroStats: [
                { value: '500+', label: 'Premium Cars' },
                { value: '50+', label: 'Locations' },
                { value: '10k+', label: 'Happy Clients' }
              ],
              navLabels: {
                link_1: 'Vehicles',
                link_2: 'Locations',
                link_3: 'Services'
              },
              locationsTitle: 'Find us globally',
              locationsSubtitle: 'We have premium locations in all major cities and airports across the globe.',
              locationsButton: 'View All Locations',
              ctaTitleRenter: 'Finding Your Ideal Match?',
              ctaSubtitleRenter: 'Explore options for your next vehicle. Compare, decide, and connect to find the perfect ride for your journey.',
              ctaButtonRenter: 'Explore Options',
              ctaTitleHost: 'Managing Your Car Journey?',
              ctaSubtitleHost: 'Unlock tools to track, manage, or find a new home for your vehicle with effortless ease and complete security.',
              ctaButtonHost: 'List Your Car',
              enhanceTitle: 'Enhance Your Experience',
              enhanceSubtitle: 'Find premium accessories and book exclusive services to make your journey truly unforgettable.',
              appTitle: 'Get the Drive App',
              appSubtitle: 'Download the app and find your perfect drive instantly. Manage bookings, unlock cars directly, and access 24/7 premium support.',
              appStoreLabel: 'App Store',
              googlePlayLabel: 'Google Play',
              newsletterTitle: 'Stay Updated with CarRentify',
              newsletterSubtitle: 'Join our exclusive newsletter for the latest premium additions, exclusive offers, and VIP access perfectly suited for your luxury lifestyle.'
            },
            fr: {
              title: 'Votre trajet doit être à la hauteur de la route !',
              subtitle: "Découvrez des performances d'élite et un prestige inégalé à chaque kilomètre parcouru.",
              heroStats: [
                { value: '500+', label: 'Voitures de Prestige' },
                { value: '50+', label: 'Emplacements' },
                { value: '10k+', label: 'Clients Heureux' }
              ],
              navLabels: {
                link_1: 'Véhicules',
                link_2: 'Emplacements',
                link_3: 'Services'
              },
              locationsTitle: 'Trouvez-nous dans le monde entier',
              locationsSubtitle: 'Nous avons des emplacements premium dans toutes les grandes villes et aéroports du monde.',
              locationsButton: 'Voir tous les emplacements',
              ctaTitleRenter: 'Trouvez votre match idéal ?',
              ctaSubtitleRenter: 'Explorez les options pour votre prochain véhicule. Comparez, décidez et connectez-vous pour trouver le trajet parfait.',
              ctaButtonRenter: 'Explorer les options',
              ctaTitleHost: 'Gérez votre parcours automobile ?',
              ctaSubtitleHost: 'Débloquez des outils pour suivre, gérer ou trouver une nouvelle maison pour votre véhicule en toute sécurité.',
              ctaButtonHost: 'Inscrire ma voiture',
              enhanceTitle: 'Améliorez Votre Expérience',
              enhanceSubtitle: 'Trouvez des accessoires haut de gamme et réservez des services exclusifs pour rendre votre voyage inoubliable.',
              appTitle: 'Obtenir l\'Application Drive',
              appSubtitle: 'Téléchargez l\'application, gérez vos réservations et accédez à notre support premium 24/7.',
              appStoreLabel: 'App Store',
              googlePlayLabel: 'Google Play'
            },
            es: {
              title: '¡Tu viaje debe estar a la altura de la carretera!',
              subtitle: 'Experimenta un rendimiento de élite y un prestigio inigualable con cada kilómetro que recorras.',
              heroStats: [
                { value: '500+', label: 'Autos Premium' },
                { value: '50+', label: 'Ubicaciones' },
                { value: '10k+', label: 'Clientes Felices' }
              ],
              navLabels: {
                link_1: 'Vehículos',
                link_2: 'Ubicaciones',
                link_3: 'Servicios'
              },
              locationsTitle: 'Encuéntranos a nivel mundial',
              locationsSubtitle: 'Tenemos ubicaciones premium en las principales ciudades y aeropuertos del mundo.',
              locationsButton: 'Ver todas las ubicaciones',
              ctaTitleRenter: '¿Encuentra tu pareja ideal?',
              ctaSubtitleRenter: 'Explore opciones para su próximo vehículo. Compare, decida y conéctese para encontrar el viaje perfecto.',
              ctaButtonRenter: 'Explorar opciones',
              ctaTitleHost: '¿Gestionas tu viaje en coche?',
              ctaSubtitleHost: 'Desbloquee herramientas para rastrear, administrar o encontrar un nuevo hogar para su vehículo con facilidad y seguridad.',
              ctaButtonHost: 'Anunciar mi coche',
              enhanceTitle: 'Mejore su Experiencia',
              enhanceSubtitle: 'Encuentre accesorios premium y reserve servicios exclusivos para hacer que su viaje sea inolvidable.',
              appTitle: 'Obtener la Aplicación Drive',
              appSubtitle: 'Descarga la app, gestiona reservas y accede a nuestro soporte premium 24/7.',
              appStoreLabel: 'App Store',
              googlePlayLabel: 'Google Play'
            },
            ar: {
              title: 'يجب أن تتطابق رحلتك مع الطريق!',
              subtitle: 'اختبر أداءً نخبوياً وفخامة لا ميل لها مع كل ميل تقطعه.',
              heroStats: [
                { value: '+500', label: 'سيارات فاخرة' },
                { value: '+50', label: 'موقعاً' },
                { value: '+10', label: 'ألف عميل سعيد' }
              ],
              navLabels: {
                link_1: 'الأسطول',
                link_2: 'المواقع',
                link_3: 'الخدمات'
              },
              locationsTitle: 'تجدنا على مستوى العالم',
              locationsSubtitle: 'لدينا مواقع متميزة في جميع المدن والمطارات الرئيسية في جميع أنحاء العالم.',
              locationsButton: 'عرض جميع المواقع',
              ctaTitleRenter: 'هل تبحث عن شريكك المثالي؟',
              ctaSubtitleRenter: 'استكشف الخيارات لسيارتك القادمة. قارن، قرر، وتواصل للعثور على الرحلة المثالية لرحلتك.',
              ctaButtonRenter: 'استكشف الخيارات',
              ctaTitleHost: 'هل تدير رحلة سيارتك؟',
              ctaSubtitleHost: 'افتح الأدوات لتتبع سيارتك أو إدارتها أو العثور على منزل جديد لها بسهولة وأمان تام.',
              ctaButtonHost: 'أدرج سيارتي',
              enhanceTitle: 'عزز تجربتك',
              enhanceSubtitle: 'اعثر على الإكسسوارات الفاخرة واحجز الخدمات الحصرية لجعل رحلتك لا تُنسى حقاً.',
              appTitle: 'احصل على تطبيق القيادة',
              appSubtitle: 'قم بتنزيل التطبيق وإدارة حجوزاتك والوصول إلى دعمنا المتميز على مدار 24/7.',
              appStoreLabel: 'متجر التطبيقات',
              googlePlayLabel: 'جوجل بلاي'
            },
            zh: {
              title: '您的座驾应与道路相配！',
              subtitle: '在您行驶的每一英里中，体验卓越的性能和无与伦比的威望。',
              heroStats: [
                { value: '500+', label: '高级车辆' },
                { value: '50+', label: '网点' },
                { value: '10k+', label: '幸福客户' }
              ],
              navLabels: {
                link_1: '车辆',
                link_2: '网点',
                link_3: '服务'
              },
              locationsTitle: '全球寻觅',
              locationsSubtitle: '我们在全球所有主要城市和机场都设有优质网点。',
              locationsButton: '查看所有网点',
              brandsTitle: '计划您的旅行',
              brandsSubtitle: '探索我们的品牌',
              brandsDescription: '从我们多样化的顶级汽车合作伙伴车队中选择您的完美座驾。',
              featuredTitle: '精选车队',
              featuredSubtitle: '为您下一次豪华体验提供的顶级车辆。',
              testimonialsTitle: '客户评价',
              testimonialsSubtitle: '深受数千人信任',
              testimonialsDescription: '来自全球 CarRentify 客户的真实故事。',
              destinationsTitle: '驾驶目的地',
              destinationsSubtitle: '为您带来极致驾驭体验的精选路线。',
              ctaTitleRenter: '寻找您的理想匹配？',
              ctaSubtitleRenter: '为您的下一辆车探索选项。比较、决定并联系，为您的旅程找到完美的座驾。',
              ctaButtonRenter: '探索选项',
              ctaTitleHost: '管理您的汽车之旅？',
              ctaSubtitleHost: '解锁工具以跟踪、管理或轻松安全地为您的车辆寻找新家。',
              ctaButtonHost: '列出我的车',
              enhanceTitle: '提升您的体验',
              enhanceSubtitle: '寻找高级配件并预订独家服务，让您的旅程真正难忘。',
              appTitle: '获取驾驶应用程序',
              appSubtitle: '下载应用程序，管理您的预订，并访问我们24/7的高级支持。',
              appStoreLabel: '应用商店',
              googlePlayLabel: '谷歌播放'
            }
          },
          heroImageUrl: '/hero-car-new.png',
          headerNavLinks: [
            { id: 'link_1', url: '/vehicles', target: '_self' },
            { id: 'link_2', url: '/locations', target: '_self' },
            { id: 'link_3', url: '/services', target: '_self' }
          ],
          showHeroSection: true,
          showFeaturedCars: true,
          showTestimonials: true,
          showBrandsSection: true,
          showDestinationsSection: true,
          showCTASection: true,
          showLocationsSection: true,
          showEnhanceSection: true,
          showAppSection: true,
          ctaImageRenter: '',
          ctaImageHost: '',
          enhanceImage: '',
          appImage: '',
          appStoreLink: 'https://apple.com/app-store',
          googlePlayLink: 'https://play.google.com/store',
        }
      };

      // Seed meta-data collections FIRST so we have IDs for general settings
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

      // Migration: Split the legacy 'one document' settings if it exists
      const allDocs = await this.settingModel.find().lean();
      const legacyDoc = allDocs.find(d => !['general', 'frontend', 'smtp', 'social', 'financials', 'listings'].includes(d._id.toString()));
      
      if (legacyDoc) {
        console.log('Migrating legacy settings to modular sections...');
        const legacy: any = legacyDoc;
        for (const [key, defaults] of Object.entries(sections)) {
          const sectionData: any = { _id: key };
          Object.keys(defaults).forEach(field => {
            if (legacy[field] !== undefined) sectionData[field] = legacy[field];
          });
          await this.settingModel.findOneAndUpdate({ _id: key }, { $set: sectionData }, { upsert: true });
        }
        await this.settingModel.deleteOne({ _id: legacy._id });
      }

      // Ensure all modular sections exist with defaults and have all required keys
      for (const [key, defaults] of Object.entries(sections)) {
        const exists = await this.settingModel.findById(key);
        if (!exists) {
          await this.settingModel.create({ _id: key, ...defaults });
        } else {
          // Check for missing keys in existing documents
          const existingData = exists.toObject() as any;
          const missingFields: any = {};
          let hasMissing = false;

          Object.keys(defaults).forEach(field => {
            if (existingData[field] === undefined) {
              missingFields[field] = (defaults as any)[field];
              hasMissing = true;
            } else if (field === 'heroTranslations' && (defaults as any).heroTranslations) {
              // Deep merge translations
              const defaultTranslations = (defaults as any).heroTranslations;
              const existingTranslations = existingData.heroTranslations || {};
              let translationsModified = false;

              Object.keys(defaultTranslations).forEach(lang => {
                let langModified = false;
                if (!existingTranslations[lang]) {
                  existingTranslations[lang] = defaultTranslations[lang];
                  langModified = true;
                } else {
                  // Merge fields for existing language
                  Object.keys(defaultTranslations[lang]).forEach(transKey => {
                    const existingVal = existingTranslations[lang][transKey];
                    if (existingVal === undefined || existingVal === "" || existingVal === null) {
                      existingTranslations[lang][transKey] = defaultTranslations[lang][transKey];
                      langModified = true;
                    }
                  });
                }

                if (langModified) {
                  console.log(`Detected missing or empty translations for ${key} in ${lang}, merging...`);
                  missingFields[field] = existingTranslations;
                  hasMissing = true;
                }
              });
            }
          });

          if (hasMissing) {
            console.log(`Synchronizing database section ${key} with new fields:`, Object.keys(missingFields));
            await this.settingModel.findByIdAndUpdate(key, { $set: missingFields }, { new: true });
          }

          // Force Cleanup for broken placeholders or missing text added in previous turns
          if (key === 'frontend') {
             const updates: any = {};
             let needsRepair = false;

             if (existingData.ctaImageRenter === '/car-5.png' || existingData.ctaImageHost === '/car-2.png') {
                updates.ctaImageRenter = '';
                updates.ctaImageHost = '';
                needsRepair = true;
             }

             // Force inject CTA text for EN if empty
             const trans = existingData.heroTranslations || {};
             if (trans.en && (!trans.en.ctaTitleRenter || trans.en.ctaTitleRenter === "")) {
                console.log("Repairing English CTA text...");
                const defaults = (sections.frontend as any).heroTranslations.en;
                Object.keys(defaults).forEach(k => {
                   if (k.startsWith('cta')) {
                      if (!trans.en[k]) trans.en[k] = defaults[k];
                   }
                });
                updates.heroTranslations = trans;
                needsRepair = true;
             }

             if (needsRepair) {
                console.log(`Force repairing settings section ${key}...`);
                await this.settingModel.findByIdAndUpdate(key, { $set: updates });
             }
          }
        }
      }
    } catch (err) {
      console.warn('Settings Database connection failed. Running modular seeds locally.');
    }
  }

  async getCurrencies() { return this.currencyModel.find({ isActive: true }); }
  async getLanguages() { return this.languageModel.find({ isActive: true }); }
  async getTimezones() { return this.timezoneModel.find({ isActive: true }); }

  async getSettings(): Promise<any> {
    const docs = await this.settingModel.find().lean();
    
    // Failsafe Migration: If we find a legacy ObjectId document, split it now
    const legacyDoc = docs.find(d => !['general', 'frontend', 'smtp', 'social', 'financials', 'listings'].includes(d._id.toString()));
    if (legacyDoc) {
      console.log('Failsafe Migration Triggered: Splitting legacy settings...');
      const legacy: any = legacyDoc;
      const sections = {
        general: ['primaryColor', 'secondaryColor', 'siteName', 'siteUrl', 'favicon', 'logoDark', 'logoLight', 'defaultLanguage', 'defaultCurrency', 'defaultTimezone', 'email', 'phone', 'copyright', 'isAdminPanelEnabled'],
        social: ['socialLinks'],
        smtp: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'smtpFrom', 'emailVerificationEnabled'],
        financials: ['walletBalance', 'minWithdrawalAmount', 'commissionRate'],
        listings: ['maxImagesPerListing'],
        frontend: ['heroTranslations', 'heroImageUrl', 'headerNavLinks', 'footerLinks', 'showHeroSection', 'showFeaturedCars', 'showTestimonials', 'showBrandsSection', 'showDestinationsSection', 'showCTASection', 'showLocationsSection', 'showEnhanceSection', 'showAppSection', 'showNewsletter', 'ctaImageRenter', 'ctaImageHost', 'enhanceImage', 'appImage', 'appStoreLink', 'googlePlayLink']
      };

      for (const [sectionId, fields] of Object.entries(sections)) {
        const sectionData: any = { _id: sectionId };
        fields.forEach(field => {
          if (legacy[field] !== undefined) sectionData[field] = legacy[field];
        });
        if (Object.keys(sectionData).length > 1) {
          await this.settingModel.findOneAndUpdate({ _id: sectionId }, { $set: sectionData }, { upsert: true });
        }
      }
      await this.settingModel.deleteOne({ _id: legacy._id });
      return this.getSettings();
    }

    return docs.reduce((merged, doc: any) => {
      const { _id, __v, createdAt, updatedAt, ...fields } = doc;
      return { ...merged, ...fields };
    }, {});
  }

  async updateSettings(updateDto: Partial<any>) {
    const sections = {
      general: ['primaryColor', 'secondaryColor', 'siteName', 'siteUrl', 'favicon', 'logoDark', 'logoLight', 'defaultLanguage', 'defaultCurrency', 'defaultTimezone', 'email', 'phone', 'copyright', 'isAdminPanelEnabled'],
      social: ['socialLinks'],
      smtp: ['smtpHost', 'smtpPort', 'smtpUser', 'smtpPassword', 'smtpFrom', 'emailVerificationEnabled'],
      financials: ['walletBalance', 'minWithdrawalAmount', 'commissionRate'],
      listings: ['maxImagesPerListing'],
      frontend: ['heroTranslations', 'heroImageUrl', 'headerNavLinks', 'showHeroSection', 'showFeaturedCars', 'showTestimonials', 'showBrandsSection', 'showDestinationsSection', 'showCTASection', 'showLocationsSection', 'showEnhanceSection', 'showAppSection', 'ctaImageRenter', 'ctaImageHost', 'enhanceImage', 'appImage', 'appStoreLink', 'googlePlayLink']
    };

    for (const [sectionId, fields] of Object.entries(sections)) {
      const sectionUpdate: any = {};
      fields.forEach(field => {
        if (updateDto[field] !== undefined) sectionUpdate[field] = updateDto[field];
      });

      if (Object.keys(sectionUpdate).length > 0) {
        await this.settingModel.findOneAndUpdate(
          { _id: sectionId },
          { $set: sectionUpdate },
          { upsert: true }
        );
      }
    }

    return this.getSettings();
  }

  async getPrimaryColor() {
    const doc = await this.settingModel.findById('general').lean();
    return (doc as any)?.primaryColor || '#3f147b';
  }
}
