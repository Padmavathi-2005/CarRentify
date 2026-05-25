import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Controller('media')
export class MediaController {
  @Post('upload')
  async upload(@Body() body: { fileName: string; base64: string; folder?: string }) {
    if (!body.base64) {
      throw new BadRequestException('No base64 data provided');
    }

    const matches = body.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new BadRequestException('Invalid base64 string');
    }

    const extension = body.fileName.split('.').pop() || 'png';
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    
    // Support custom folders (default to listings)
    const folderName = body.folder ? body.folder.replace(/[^a-zA-Z0-9_-]/g, '') : 'listings';
    const uploadDir = path.join(process.cwd(), 'public', 'images', folderName);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, uniqueName);
    const buffer = Buffer.from(matches[2], 'base64');
    
    fs.writeFileSync(filePath, buffer);

    return {
      message: 'Upload successful',
      url: `/images/${folderName}/${uniqueName}`,
      path: `/images/${folderName}/${uniqueName}`
    };
  }
}
