import {
  Controller,
  Post,
  Body,
  UnauthorizedException,
  BadRequestException,
  Get,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../users/schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { SettingsService } from '../settings/settings.service';
import { JwtAuthGuard } from './strategies/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private settingsService: SettingsService,
    @InjectModel(User.name) private userModel: Model<User>,
    private notificationsService: NotificationsService,
  ) {}

  @Post('register')
  async register(@Body() body: any) {
    const { email, password, firstName, lastName, displayName, phone } = body;
    const name = displayName || `${firstName} ${lastName}`.trim();

    // 1. Password Rule: min 6 chars
    if (password && password.length < 6) {
      throw new BadRequestException(
        'Password must be at least 6 characters long',
      );
    }

    // 2. Email Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // 3. Unique Display Name Check (if provided)
    if (displayName) {
      const nameExists = await this.userModel.findOne({
        displayName: displayName,
        email: { $ne: email },
      });
      if (nameExists) {
        throw new BadRequestException(
          'Display Name is already in use by another user',
        );
      }
    }

    // 4. Find existing or create new
    let user = await this.userModel.findOne({ email });
    const hashedPassword = password
      ? await bcrypt.hash(password, 12)
      : undefined;

    if (user) {
      // Update existing user (Sync/Re-registration)
      const updateData: any = { phone };
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (displayName) updateData.displayName = displayName;
      if (hashedPassword) updateData.password = hashedPassword;

      user = await this.userModel.findOneAndUpdate(
        { email },
        { $set: updateData },
        { returnDocument: 'after' },
      );
    } else {
      // Create new user
      user = await this.userModel.create({
        email,
        firstName: firstName || displayName || 'Guest',
        lastName: lastName || '',
        displayName:
          displayName || `${firstName} ${lastName}`.trim() || 'Guest',
        phone,
        password: hashedPassword,
      });
    }

    if (!user) {
      throw new BadRequestException('Failed to process user account');
    }

    // Notify Admins about new registration
    try {
      const admins = await this.userModel.find({ role: 'admin' }).exec();
      const primaryAdminEmail = 'admin@gmail.com';
      if (!admins.find(a => a.email === primaryAdminEmail)) {
        const primaryAdmin = await this.userModel.findOne({ email: primaryAdminEmail }).exec();
        if (primaryAdmin) admins.push(primaryAdmin);
      }
      
      if (admins.length > 0) {
        await Promise.all(admins.map(admin => 
          this.notificationsService.create(
            admin._id.toString(),
            'New User Registered',
            `A new user (${user.displayName || user.firstName}) has joined the platform.`,
            'info',
            { 
              type: 'new_user', 
              userId: user._id.toString(),
              url: `/admin/users`
            }
          )
        ));
      }
    } catch (err) {
      console.error('[AuthController] Failed to notify admins of new registration:', err);
    }

    const settings = await this.settingsService.getSettings();
    if (settings && settings.emailVerificationEnabled) {
      return this.authService.generateOTP(user.email);
    }

    return this.authService.login(user);
  }

  @Post('login')
  async login(@Body() body: any) {
    const { email, password } = body;

    // Check if user exists
    const exists = await this.userModel.findOne({ email });
    if (!exists) {
      // Detect as new user for onboarding
      return { onboarding: true, email };
    }

    const user = await this.authService.validateUser(email, password, false);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const settings = await this.settingsService.getSettings();
    if (settings && settings.emailVerificationEnabled) {
      return this.authService.generateOTP(user.email);
    }

    return this.authService.login(user);
  }

  @Post('admin/login')
  async adminLogin(@Body() body: any) {
    const { email, password } = body;
    const user = await this.authService.validateUser(email, password, true);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(user);
  }

  @Post('verify-otp')
  async verify(@Body() body: any) {
    const { email, code } = body;
    return this.authService.verifyOTP(email, code);
  }

  @Post('resend-otp')
  async resend(@Body() body: any) {
    const { email } = body;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('User not found');
    }
    return this.authService.generateOTP(email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    return this.authService.resetPassword(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    return this.userModel.findById(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req: any, @Body() body: any) {
    const { currentPassword, newPassword, confirmPassword } = body;
    const userId = req.user.userId;

    const user = await this.userModel.findById(userId);
    if (!user) throw new BadRequestException('User not found');

    // 1. Verify Current
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw new UnauthorizedException('Current password incorrect');

    // 2. Validate New
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Passwords do not match');
    }
    if (newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters');
    }

    // 3. Update
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    return { status: 'success', message: 'Credentials updated' };
  }
}
