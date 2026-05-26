import { Controller, Post, Req, BadRequestException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import * as fs from 'fs';
import * as path from 'path';

@Controller('media')
export class MediaController {
  @Post('upload')
  async upload(@Req() req: FastifyRequest) {
    if (req.isMultipart()) {
      const data = await req.file();
      if (!data) throw new BadRequestException('No file uploaded');

      const folderField = data.fields.folder;
      const folderStr = (folderField && 'value' in folderField) 
        ? String(folderField.value).replace(/[^a-zA-Z0-9_-]/g, '') 
        : 'listings';
      
      const extension = data.filename.split('.').pop() || 'png';
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
      
      const uploadDir = path.join(process.cwd(), 'public', 'images', folderStr);
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const filePath = path.join(uploadDir, uniqueName);
      const buffer = await data.toBuffer();
      fs.writeFileSync(filePath, buffer);
      
      return {
        message: 'Upload successful',
        url: `/images/${folderStr}/${uniqueName}`,
        path: `/images/${folderStr}/${uniqueName}`
      };
    } else {
      // Legacy Base64 support
      const body = req.body as any;
      if (!body || !body.base64) {
        throw new BadRequestException('No base64 data provided');
      }

      const matches = body.base64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        throw new BadRequestException('Invalid base64 string');
      }

      const extension = (body.fileName || 'image.png').split('.').pop() || 'png';
      const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
      
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
}
