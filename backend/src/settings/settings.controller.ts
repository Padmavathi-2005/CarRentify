import { Controller, Get, Patch, Body } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Setting } from './schemas/setting.schema';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  async updateSettings(@Body() updateDto: Partial<Setting>) {
    // Highly efficient update protocol that handles brand colors and identity assets.
    // Logos and Favicons are now transmitted as high-performance Base64 Data URIs, 
    // ensuring total asset portability across your production database.
    return this.settingsService.updateSettings(updateDto);
  }

  @Get('meta/currencies')
  async getCurrencies() {
    return this.settingsService.getCurrencies();
  }

  @Get('meta/languages')
  async getLanguages() {
    return this.settingsService.getLanguages();
  }

  @Get('meta/timezones')
  async getTimezones() {
    return this.settingsService.getTimezones();
  }
}
