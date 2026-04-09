import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Newsletter, NewsletterDocument } from './schemas/newsletter.schema';
import emailValidator from 'deep-email-validator';

@Injectable()
export class NewsletterService {
  constructor(
    @InjectModel(Newsletter.name) private newsletterModel: Model<NewsletterDocument>,
  ) {}

  async subscribe(email: string): Promise<{ message: string }> {
    // Provide deep verification via DNS and SMTP
    const { valid, reason, validators } = await emailValidator({
       email,
       validateRegex: true,
       validateMx: true,
       validateTypo: true,
       validateDisposable: true,
       validateSMTP: true,
    });

    if (!valid) {
       let errorMsg = 'Invalid email address format.';
       if (reason === 'typo') errorMsg = `Typo detected. Did you mean ${validators.typo?.reason}?`;
       else if (reason === 'disposable') errorMsg = 'Disposable emails are blocked.';
       else if (reason === 'smtp') errorMsg = 'This email inbox does not seem to exist.';
       else if (reason === 'mx') errorMsg = 'Invalid domain configured for email.';
       
       throw new BadRequestException({ message: 'invalid', details: errorMsg });
    }

    // Verify it doesn't already exist in our DB
    const existing = await this.newsletterModel.findOne({ email });
    if (existing) {
       throw new BadRequestException({ message: 'exists' });
    }

    // Persist completely validated email
    await this.newsletterModel.create({ email });
    return { message: 'success' };
  }
}
