import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private settingsService: SettingsService,
  ) {}

  async onModuleInit() {
    // Seed Admin User
    const adminEmail = 'admin@gmail.com';
    const exists = await this.userModel.findOne({ email: adminEmail });
    if (!exists) {
      const hashedPassword = await bcrypt.hash('12345678', 10);
      await this.userModel.create({
        firstName: 'System',
        lastName: 'Administrator',
        displayName: 'AdminHQ',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true,
        isVerified: true
      });
      console.log('[AuthService] Admin account provisioned: admin@gmail.com');
    }
  }

  async validateUser(email: string, pass: string, isAdminAction: boolean = false): Promise<any> {
    const user = await this.userModel.findOne({ email: new RegExp('^' + email + '$', 'i') });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.isActive === false && user.deactivatedAt) {
      const gracePeriodDays = 7;
      const diffTime = Math.abs(Date.now() - new Date(user.deactivatedAt).getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays <= gracePeriodDays) {
        throw new UnauthorizedException(`ACCOUNT_DEACTIVATED_GRACE_PERIOD|You have ${gracePeriodDays - diffDays + 1} days to recover your account.`);
      } else {
        throw new UnauthorizedException('This account has been permanently deactivated.');
      }
    }

    if (user.isActive === false) {
      throw new UnauthorizedException('This account has been deactivated.');
    }

    // Security Constraint: Admins cannot use normal login forms
    if (user.role === 'admin' && !isAdminAction) {
      throw new UnauthorizedException('Administrative access required for this account.');
    }
    
    // Regular users cannot use admin login forms
    if (user.role !== 'admin' && isAdminAction) {
      throw new UnauthorizedException('Insufficient permissions.');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new UnauthorizedException('Account locked. Try again later.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException(
        `Invalid credentials. Attempts left: ${this.MAX_ATTEMPTS - (user.loginAttempts + 1)}`,
      );
    }

    // Reset attempts on successful login
    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: 0, lockUntil: null } },
    );

    const { password, ...result } = user.toObject();
    return result;
  }

  private async handleFailedLogin(user: UserDocument) {
    const attempts = user.loginAttempts + 1;
    let lockUntil = null;

    if (attempts >= this.MAX_ATTEMPTS) {
      lockUntil = Date.now() + this.LOCK_TIME;
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { loginAttempts: attempts, lockUntil } },
    );
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id.toString(), role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        _id: user._id,
        email: user.email,
        displayName: user.displayName || user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImage: user.profileImage,
        role: user.role,
        wishlist: user.wishlist,
        isVerified: user.isVerified || false,
        verificationStatus: user.verificationStatus || 'not_submitted',
      },
    };
  }

  async generateOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await this.userModel.updateOne(
      { email: new RegExp('^' + email + '$', 'i') },
      { $set: { otpCode: otp, otpExpires: expires } },
    );

    // Send email using SMTP settings
    const settings = await this.settingsService.getSettings();
    if (settings && settings.smtpHost && settings.smtpUser && settings.smtpPassword) {
      try {
        const transporter = nodemailer.createTransport({
          host: settings.smtpHost,
          port: parseInt(settings.smtpPort) || 587,
          secure: parseInt(settings.smtpPort) === 465,
          auth: {
            user: settings.smtpUser,
            pass: settings.smtpPassword,
          },
        });

        // Fire and forget email so we don't block the auth flow if SMTP is slow/down
        transporter.sendMail({
          from:
            settings.smtpFrom || '"CarRental System" <noreply@carrental.com>',
          to: email,
          subject: 'CarRental Security: Your Access OTP',
          text: `Your One-Time Password is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share it with anyone.`,
          html: `
              <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <h2 style="color: #3f147b;">CarRental Security</h2>
                <p>Your One-Time Password is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; color: #3f147b;">${otp}</h1>
                <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
              </div>
            `,
        }).then(() => {
          console.log(`[AuthService] OTP successfully sent to ${email} via SMTP.`);
        }).catch(err => {
          console.error(`[AuthService] Failed to send OTP via SMTP to ${email}:`, err);
        });
      } catch (err) {
        console.error('[AuthService] SMTP Transporter creation failed:', err);
      }
    } else {
      console.log(
        `[AuthService] SMTP not fully configured. OTP generated for ${email}: ${otp}`,
      );
    }

    return { message: 'OTP sent to email', otp };
  }

  async verifyOTP(email: string, code: string) {
    const user = await this.userModel.findOne({ email: new RegExp('^' + email + '$', 'i') });
    if (!user || user.otpCode !== code || user.otpExpires < Date.now()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { otpCode: null, otpExpires: null, isEmailVerified: true } },
    );
    return this.login(user);
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email: new RegExp('^' + email + '$', 'i') });
    if (!user) {
      // For security, don't reveal if user exists or not
      return { message: 'If an account exists, a reset code has been sent.' };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

    await this.userModel.updateOne(
      { _id: user._id },
      { $set: { otpCode: otp, otpExpires: expires } },
    );

    const settings = await this.settingsService.getSettings();
    if (settings && settings.smtpHost && settings.smtpUser && settings.smtpPassword) {
      const transporter = nodemailer.createTransport({
        host: settings.smtpHost,
        port: parseInt(settings.smtpPort) || 587,
        secure: parseInt(settings.smtpPort) === 465,
        auth: { user: settings.smtpUser, pass: settings.smtpPassword },
      });

      try {
        await transporter.sendMail({
          from: settings.smtpFrom || '"CarRentify Support" <support@carrentify.com>',
          to: email,
          subject: 'Reset Your Password',
          html: `
            <div style="font-family: sans-serif; padding: 20px; background: #fff; border: 1px solid #eee; border-radius: 12px; max-width: 500px; margin: auto;">
              <h2 style="color: #e11d48; margin-top: 0;">Password Reset Request</h2>
              <p style="color: #64748b;">A request was made to reset your password. Use the following code to proceed:</p>
              <div style="background: #f8fafc; padding: 24px; text-align: center; border-radius: 8px; margin: 20px 0;">
                <span style="font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #0f172a;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px;">This code is valid for 15 minutes. If you did not request this, please ignore this email.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('[AuthService] SMTP Dispatch Failed:', err.message);
        // If we are in development, we might want to throw or return the error
        // return { error: 'Email delivery failed. Please check SMTP settings.' };
      }
    } else {
      console.warn('[AuthService] SMTP skipped: Missing host, user, or password in Settings.');
    }

    return { message: 'Reset code sent' };
  }

  async resetPassword(body: any) {
    const { email, code, newPassword } = body;
    const user = await this.userModel.findOne({ email: new RegExp('^' + email + '$', 'i') });

    if (!user || user.otpCode !== code || user.otpExpires < Date.now()) {
      throw new BadRequestException('Invalid or expired reset code');
    }

    if (newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await this.userModel.updateOne(
      { _id: user._id },
      { 
        $set: { 
          password: hashedPassword, 
          otpCode: null, 
          otpExpires: null,
          loginAttempts: 0,
          lockUntil: null
        } 
      },
    );

    return { status: 'success', message: 'Password has been reset' };
  }
}
