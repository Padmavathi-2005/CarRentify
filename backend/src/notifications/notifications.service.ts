import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from './schemas/notification.schema';
import { NotificationsGateway } from './notifications.gateway';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async create(userId: string, title: string, body: string, type: string = 'info', data?: any) {
    if (!userId) {
      console.error('Notification creation failed: userId is required');
      return null;
    }
    const notification = new this.notificationModel({
      userId: userId.toString(),
      title,
      body,
      type,
      data,
    });
    const saved = await notification.save();
    
    // Log for debugging
    try {
      const logMsg = `[${new Date().toISOString()}] CREATE userId: ${userId}, title: ${title}\n`;
      fs.appendFileSync(path.join(process.cwd(), 'notif_debug.log'), logMsg);
    } catch (e) {}

    this.notificationsGateway.sendNotification(userId.toString(), 'new_notification', saved);
    return saved;
  }

  async findAll(userId: any) {
    if (!userId) return [];
    const id = userId.toString();
    
    // Log for debugging
    try {
      const logMsg = `[${new Date().toISOString()}] FINDALL userId: ${id}\n`;
      fs.appendFileSync(path.join(process.cwd(), 'notif_debug.log'), logMsg);
    } catch (e) {}

    return this.notificationModel
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(50)
      .exec();
  }

  async markAsRead(id: string, userId: string) {
    return this.notificationModel.findOneAndUpdate(
      { _id: id, userId: userId.toString() }, 
      { isRead: true }, 
      { returnDocument: 'after' }
    ).exec();
  }

  async markAllAsRead(userId: any) {
    const id = userId?.toString() || userId;
    return this.notificationModel.updateMany({ userId: id, isRead: false }, { isRead: true }).exec();
  }
}
