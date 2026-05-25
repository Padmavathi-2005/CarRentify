import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Verification, VerificationDocument, VerificationStatus } from './schemas/verification.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class VerificationService {
  constructor(
    @InjectModel(Verification.name) private verificationModel: Model<VerificationDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async submit(userId: string, documents: any[]): Promise<Verification> {
    // Extract metadata fields for profile sync
    const dobDoc = documents.find(d => d.fieldId === 'dob');
    const phoneDoc = documents.find(d => d.fieldId === 'phone_verification');

    if (dobDoc?.value) {
       const birthDate = new Date(dobDoc.value);
       const today = new Date();
       let age = today.getFullYear() - birthDate.getFullYear();
       const m = today.getMonth() - birthDate.getMonth();
       if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
           age--;
       }

       if (age < 21) {
          throw new BadRequestException('Qualification Error: You must be at least 21 years old to access the rental fleet.');
       }

       // Sync with user profile immediately
       await this.userModel.findByIdAndUpdate(userId, {
          $set: { 
            dob: dobDoc.value, 
            phone: phoneDoc?.value || undefined 
          }
       });
    }

    const existing = await this.verificationModel.findOne({ userId: new Types.ObjectId(userId) });

    let submission: VerificationDocument;
    let isUpdate = false;

    if (existing) {
      // Update existing submission
      existing.documents = documents;
      existing.status = VerificationStatus.PENDING;
      existing.adminNote = undefined;
      submission = await existing.save();
      isUpdate = true;
    } else {
      // Create new submission
      const newSubmission = new this.verificationModel({
        userId: new Types.ObjectId(userId),
        documents,
        status: VerificationStatus.PENDING,
      });
      submission = await newSubmission.save();
    }

    // Update user status
    await this.userModel.findByIdAndUpdate(userId, {
      $set: { verificationStatus: 'pending' }
    });

    // Notify all active admins
    const admins = await this.userModel.find({ role: 'admin' }).exec();
    
    // Safety check: Always include the primary admin if not found by role
    const primaryAdminEmail = 'admin@gmail.com';
    if (!admins.find(a => a.email === primaryAdminEmail)) {
      const primaryAdmin = await this.userModel.findOne({ email: primaryAdminEmail }).exec();
      if (primaryAdmin) admins.push(primaryAdmin);
    }
    
    if (admins.length > 0) {
      const user = await this.userModel.findById(userId);
      const name = user ? `${user.firstName} ${user.lastName}` : 'A user';
      
      // Target admin@gmail.com as priority if it's in the list, or all admins
      await Promise.all(admins.map(admin => 
        this.notificationsService.create(
          admin._id.toString(),
          isUpdate ? 'Verification Documents Updated' : 'New Verification Request',
          `${name} has ${isUpdate ? 'updated' : 'submitted'} ID verification documents for review.`,
          'info',
          { 
            type: 'verification_request', 
            userId: userId, 
            email: user?.email,
            url: `/admin/verification?search=${encodeURIComponent(user?.email || userId)}`
          }
        )
      ));
    }

    return submission;
  }

  async getMyStatus(userId: string): Promise<Verification | null> {
    return this.verificationModel.findOne({ userId: new Types.ObjectId(userId) }).exec();
  }

  // --- ADMIN ---

  async findAll(): Promise<any[]> {
    return this.verificationModel
      .find()
      .populate('userId', 'firstName lastName email profileImage')
      .sort({ createdAt: -1 })
      .exec();
  }

  async approve(id: string, adminNote?: string): Promise<Verification> {
    const submission = await this.verificationModel.findById(id);
    if (!submission) throw new NotFoundException('Submission not found');

    submission.status = VerificationStatus.APPROVED;
    submission.adminNote = adminNote;
    submission.reviewedAt = new Date();
    await submission.save();

    const updatePayload: any = {
      isVerified: true, verificationStatus: 'approved'
    };

    const licenseFrontDoc = submission.documents.find((d: any) => d.fieldId === 'driving_license_front' || d.fieldId === 'licenseImage');
    const licenseBackDoc = submission.documents.find((d: any) => d.fieldId === 'driving_license_back');
    const driverLicenseDoc = submission.documents.find((d: any) => d.fieldId === 'driverLicense');
    const licenseExpDoc = submission.documents.find((d: any) => d.fieldId === 'licenseExpiryDate');

    if (licenseFrontDoc?.value) {
      updatePayload.licenseImage = licenseFrontDoc.value;
    }
    if (licenseBackDoc?.value) {
      updatePayload.licenseBackImage = licenseBackDoc.value;
    }
    if (driverLicenseDoc?.value) {
      updatePayload.driverLicense = driverLicenseDoc.value;
    }
    if (licenseExpDoc?.value) {
      updatePayload.licenseExpiryDate = new Date(licenseExpDoc.value);
      updatePayload.licenseExpiryNotified = false; // Reset notification state
    }

    // Update user isVerified and license info
    await this.userModel.findByIdAndUpdate(submission.userId, {
      $set: updatePayload
    });

    // Notify user via Platform Notification
    const user = await this.userModel.findById(submission.userId);
    if (user) {
      await this.notificationsService.create(
        submission.userId.toString(),
        '✅ Identity Verified!',
        `Your documents have been verified. You can now list your car and book vehicles.${adminNote ? ` Note: ${adminNote}` : ''}`,
        'success'
      );

      // SIMULATED: Send Email Notification (Integrate real MailService here)
      console.log(`[EMAIL] To: ${user.email}, Title: Identity Verified, Body: Your documents were approved. ${adminNote || ''}`);
    }

    return submission;
  }

  async reject(id: string, adminNote: string): Promise<Verification> {
    const submission = await this.verificationModel.findById(id);
    if (!submission) throw new NotFoundException('Submission not found');

    submission.status = VerificationStatus.REJECTED;
    submission.adminNote = adminNote;
    submission.reviewedAt = new Date();
    await submission.save();

    // Reset user verification status
    await this.userModel.findByIdAndUpdate(submission.userId, {
      $set: { isVerified: false, verificationStatus: 'rejected' }
    });

    // Notify user via Platform Notification
    await this.notificationsService.create(
      submission.userId.toString(),
      '❌ Verification Rejected',
      `Your identity verification was rejected. ${adminNote ? `Reason: ${adminNote}` : 'Please resubmit with correct documents.'}`,
      'error'
    );

    // SIMULATED: Send Email Notification
    console.log(`[EMAIL] To: ${submission.userId}, Title: Verification Rejected, Body: Your documents were rejected because: ${adminNote}`);

    return submission;
  }
}
