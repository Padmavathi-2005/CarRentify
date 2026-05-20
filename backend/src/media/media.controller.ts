import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('media')
export class MediaController {
  @Post('upload')
  async upload(@Body() body: { fileName: string; base64: string }) {
    if (!body.fileName || !body.base64) {
      throw new BadRequestException('Invalid payload');
    }

    // Remove metadata prefix (e.g. data:image/png;base64,)
    const base64Data = body.base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uniqueName = `${Date.now()}-${body.fileName.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'listings');

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    return {
      url: `/images/listings/${uniqueName}`,
      success: true,
    };
  }
}
