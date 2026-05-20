import { Controller, Get, Patch, Body, Post, Delete, Param, BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { Setting } from './schemas/setting.schema';
import * as fs from 'fs';
import * as path from 'path';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Patch()
  async updateSettings(@Body() updateDto: Partial<Setting>) {
    return this.settingsService.updateSettings(updateDto);
  }
  
  @Post('upload')
  async uploadSiteAsset(@Body() body: { fileName: string; base64: string }) {
    if (!body.fileName || !body.base64) {
      throw new BadRequestException('Invalid payload');
    }

    const base64Data = body.base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uniqueName = `site-${Date.now()}-${body.fileName.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'site');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    return {
      url: `/images/site/${uniqueName}`,
      success: true,
    };
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

  // --- Payment Gateway Endpoints ---
  @Get('payments')
  async getPaymentGateways() {
    return this.settingsService.getPaymentGateways();
  }

  @Post('payments')
  async createPaymentGateway(@Body() data: any) {
    return this.settingsService.createPaymentGateway(data);
  }

  @Patch('payments/:id')
  async updatePaymentGateway(@Param('id') id: string, @Body() updateData: any) {
    return this.settingsService.updatePaymentGateway(id, updateData);
  }

  @Delete('payments/:id')
  async deletePaymentGateway(@Param('id') id: string) {
    return this.settingsService.deletePaymentGateway(id);
  }
}
