import { Controller, Post, Body, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SettingsService } from '../settings/settings.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    @InjectModel(User.name) private userModel: Model<User>
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const { email, password, firstName, lastName, displayName, phone } = body;
    const name = displayName || `${firstName} ${lastName}`.trim();

    // 1. Password Rule: min 6 chars
    if (password.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long');
    }

    // 2. Email Validation (Regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // 3. Unique Email Check
    const exists = await this.userModel.findOne({ email });
    if (exists) {
      throw new BadRequestException('Email already in use');
    }

    // 4. Secure Hashing (Bcrypt)
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const user = await this.userModel.create({
      email,
      name,
      phone,
      password: hashedPassword,
    });

    const settings = await this.settingsService.getSettings();
    if (settings && settings.smtpHost) {
      return this.authService.generateOTP(user.email);
    }

    // Auto-login bypassing OTP
    return this.authService.login(user);
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;
    const user = await this.authService.validateUser(email, password);
    
    const settings = await this.settingsService.getSettings();
    if (settings && settings.smtpHost) {
      return this.authService.generateOTP(user.email);
    }
    
    // Auto-login bypassing OTP
    return this.authService.login(user);
  }

  @Post('verify-otp')
  async verify(@Body() body: any) {
    const { email, code } = body;
    return this.authService.verifyOTP(email, code);
  }
}
