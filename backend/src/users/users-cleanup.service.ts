import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersCleanupService {
  private readonly logger = new Logger(UsersCleanupService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleAccountPurge() {
    this.logger.log('Starting daily account anonymization check...');
    
    const gracePeriodDays = 7;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - gracePeriodDays);

    // Find users who have been deactivated for more than 7 days and haven't been anonymized yet
    // We check if email is already 'deleted_' to avoid double processing
    const usersToAnonymize = await this.userModel.find({
      isActive: false,
      deactivatedAt: { $lte: cutoffDate },
      email: { $not: /^deleted_/ }
    }).exec();

    if (usersToAnonymize.length === 0) {
      this.logger.log('No accounts eligible for anonymization today.');
      return;
    }

    this.logger.log(`Found ${usersToAnonymize.length} accounts to anonymize.`);

    for (const user of usersToAnonymize) {
      const id = user._id.toString();
      const anonymizedData = {
        firstName: 'Deleted',
        lastName: 'User',
        displayName: `deleted_user_${id.substring(id.length - 4)}`,
        email: `deleted_${id}@carrental.com`,
        phone: '0000000000',
        address: 'Anonymized',
        city: 'Anonymized',
        state: 'Anonymized',
        postalCode: '00000',
        profileImage: null,
        isVerified: false,
        verificationStatus: 'not_submitted',
        walletBalance: 0,
        wishlist: [],
        // We keep deactivatedAt so we know WHEN it was purged
      };

      await this.userModel.findByIdAndUpdate(id, { $set: anonymizedData }).exec();
      this.logger.log(`Account ${id} has been permanently anonymized after grace period.`);
    }

    this.logger.log('Account anonymization task completed.');
  }
}
