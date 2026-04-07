import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  private readonly MAX_ATTEMPTS = 5;
  private readonly LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private settingsService: SettingsService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new UnauthorizedException('Account locked. Try again later.');
    }

    const isMatch = await bcrypt.compare(pass, user.password);

    if (!isMatch) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException(`Invalid credentials. Attempts left: ${this.MAX_ATTEMPTS - (user.loginAttempts + 1)}`);
    }

    // Reset attempts on successful login
    await this.userModel.updateOne({ _id: user._id }, { $set: { loginAttempts: 0, lockUntil: null } });
    
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
      { $set: { loginAttempts: attempts, lockUntil } }
    );
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user._id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
         id: user._id,
         email: user.email,
         displayName: user.displayName || user.name,
         firstName: user.firstName,
         lastName: user.lastName,
         profileImage: user.profileImage,
         role: user.role
      }
    };
  }

  async generateOTP(email: string) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    await this.userModel.updateOne(
      { email },
      { $set: { otpCode: otp, otpExpires: expires } }
    );

    // Send email using SMTP settings
    const settings = await this.settingsService.getSettings();
    if (settings && settings.smtpHost) {
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

         await transporter.sendMail({
            from: settings.smtpFrom || '"CarRentify System" <noreply@carrentify.com>',
            to: email,
            subject: 'CarRentify Security: Your Access OTP',
            text: `Your One-Time Password is: ${otp}\n\nThis code will expire in 10 minutes. Please do not share it with anyone.`,
            html: `
              <div style="font-family: sans-serif; padding: 20px; background: #f8fafc; border-radius: 10px;">
                <h2 style="color: #3f147b;">CarRentify Security</h2>
                <p>Your One-Time Password is:</p>
                <h1 style="font-size: 32px; letter-spacing: 5px; color: #3f147b;">${otp}</h1>
                <p style="color: #64748b; font-size: 12px;">This code will expire in 10 minutes. Please do not share it with anyone.</p>
              </div>
            `
         });
         console.log(`[AuthService] OTP successfully sent to ${email} via SMTP.`);
      } catch (err) {
         console.error(`[AuthService] Failed to send OTP via SMTP to ${email}:`, err);
      }
    } else {
       console.log(`[AuthService] SMTP not configured. OTP generated for ${email}: ${otp}`);
    }

    return { message: 'OTP sent to email', otp }; 
  }

  async verifyOTP(email: string, code: string) {
    const user = await this.userModel.findOne({ email });
    if (!user || user.otpCode !== code || user.otpExpires < Date.now()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    await this.userModel.updateOne({ _id: user._id }, { $set: { otpCode: null, otpExpires: null, isEmailVerified: true } });
    return this.login(user);
  }
}
