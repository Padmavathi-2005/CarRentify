import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectModel(Setting.name) private settingModel: Model<SettingDocument>,
  ) {}

  async onModuleInit() {
    // Ensure at least one settings document exists
    const exists = await this.settingModel.findOne();
    if (!exists) {
      await this.settingModel.create({
        primaryColor: '#17094a',
        siteName: 'CarRentify',
      });
    }
  }

  async getSettings() {
    return this.settingModel.findOne();
  }

  async updateSettings(updateDto: Partial<Setting>) {
    return this.settingModel.findOneAndUpdate({}, updateDto, { new: true });
  }

  async getPrimaryColor() {
    const settings = await this.getSettings();
    return settings?.primaryColor || '#17094a';
  }
}
