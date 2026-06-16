import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Destination, DestinationDocument } from './schemas/destination.schema';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class DestinationsService {
  constructor(
    @InjectModel(Destination.name)
    private destinationModel: Model<DestinationDocument>,
  ) {}

  async findAll(): Promise<Destination[]> {
    return this.destinationModel
      .find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .exec();
  }

  async findAllAdmin(): Promise<Destination[]> {
    return this.destinationModel.find().sort({ order: 1, createdAt: 1 }).exec();
  }

  async create(dto: Partial<Destination>): Promise<Destination> {
    // Auto-assign next order if not provided
    if (dto.order === undefined) {
      const count = await this.destinationModel.countDocuments();
      dto.order = count;
    }
    return this.destinationModel.create(dto);
  }

  async update(
    id: string,
    dto: Partial<Destination>,
  ): Promise<Destination | null> {
    return this.destinationModel
      .findByIdAndUpdate(id, { $set: dto }, { returnDocument: 'after' })
      .exec();
  }

  async remove(id: string): Promise<void> {
    const dest = await this.destinationModel.findById(id).exec();
    if (dest?.image) {
      // Clean up uploaded file
      const filePath = path.join(process.cwd(), 'public', dest.image);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (err) {
          console.warn('Failed to delete image file:', err);
        }
      }
    }
    await this.destinationModel.findByIdAndDelete(id).exec();
  }

  async uploadImage(
    id: string,
    fileName: string,
    base64: string,
  ): Promise<string> {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const uniqueName = `dest-${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'images',
      'destinations',
    );
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, uniqueName);
    fs.writeFileSync(filePath, buffer);

    const imageUrl = `/images/destinations/${uniqueName}`;

    // Remove old image file if replacing
    const existing = await this.destinationModel.findById(id).exec();
    if (existing?.image) {
      const oldPath = path.join(process.cwd(), 'public', existing.image);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await this.destinationModel
      .findByIdAndUpdate(id, { $set: { image: imageUrl } })
      .exec();
    return imageUrl;
  }

  async reorder(orderedIds: string[]): Promise<void> {
    const updates = orderedIds.map((id, index) =>
      this.destinationModel
        .findByIdAndUpdate(id, { $set: { order: index } })
        .exec(),
    );
    await Promise.all(updates);
  }
}
