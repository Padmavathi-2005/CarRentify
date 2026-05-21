import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class LicenseCronService {
  private readonly logger = new Logger(LicenseCronService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleLicenseExpiry() {
    this.logger.log('Starting daily license expiry check...');
    
    // Find users whose license expires in exactly 30 days or less, and who haven't been notified
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);

    const usersToNotify = await this.userModel.find({
      licenseExpiryDate: { $lte: thirtyDaysFromNow },
      licenseExpiryNotified: { $ne: true },
      isActive: true,
    }).exec();

    if (usersToNotify.length === 0) {
      this.logger.log('No users to notify about license expiry today.');
      return;
    }

    this.logger.log(`Found ${usersToNotify.length} users with expiring licenses.`);

    for (const user of usersToNotify) {
      const id = user._id.toString();
      
      const expiryStr = user.licenseExpiryDate.toISOString().split('T')[0];
      
      try {
        await this.notificationsService.create(
          id,
          'Action Required: License Expiring Soon',
          `Your driver's license will expire on ${expiryStr}. Please update your license to continue booking cars.`,
          'warning',
          { url: '/dashboard/profile?updateLicense=true' }
        );
        
        // Mark as notified so we don't spam them every day
        await this.userModel.findByIdAndUpdate(id, { $set: { licenseExpiryNotified: true } }).exec();
        this.logger.log(`Notified user ${id} about license expiry on ${expiryStr}.`);
      } catch (err) {
        this.logger.error(`Failed to notify user ${id} about license expiry`, err);
      }
    }

    this.logger.log('License expiry check completed.');
  }
}
