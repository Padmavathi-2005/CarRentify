import { Controller, Get, Post, Body, UseGuards, Req, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/strategies/jwt-auth.guard';
import { TransactionType } from './schemas/transaction.schema';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Req() req: any) {
    return this.walletService.getWalletBalance(req.user.userId);
  }

  @Get('transactions')
  async getTransactions(@Req() req: any) {
    return this.walletService.getTransactions(req.user.userId);
  }

  // Example entry point for user to add funds (simulated for now, would usually integrate with Stripe)
  @Post('add-funds')
  async addFunds(@Req() req: any, @Body() body: { amount: number; description?: string }) {
    return this.walletService.addFunds(
      req.user.userId,
      body.amount,
      body.description || 'User added funds',
    );
  }

  @Post('create-checkout-session')
  async createCheckoutSession(@Req() req: any, @Body() body: { amount: number; method: string }) {
    return this.walletService.createCheckoutSession(req.user.userId, body.amount, body.method);
  }

  @Post('capture-paypal/:orderId')
  async capturePayPal(@Req() req: any, @Param('orderId') orderId: string) {
    return this.walletService.capturePayPalOrder(req.user.userId, orderId);
  }

  @Post('capture-stripe/:sessionId')
  async captureStripe(@Req() req: any, @Param('sessionId') sessionId: string) {
    return this.walletService.captureStripeSession(req.user.userId, sessionId);
  }

  @Get('payout-method')
  async getPayoutMethod(@Req() req: any) {
    return this.walletService.getPayoutMethod(req.user.userId);
  }

  @Post('payout-method')
  async savePayoutMethod(@Req() req: any, @Body() body: any) {
    return this.walletService.savePayoutMethod(req.user.userId, body);
  }

  @Get('stats')
  async getStats(@Req() req: any) {
    return this.walletService.getWalletStats(req.user.userId);
  }

  @Post('withdraw')
  async requestWithdrawal(@Req() req: any, @Body() body: { amount: number; description?: string }) {
    return this.walletService.requestWithdrawal(req.user.userId, body.amount, body.description || 'Withdrawal request');
  }

  // Admin can call this (ensure to check for admin role in a real app)
  @Post('admin/update-balance')
  async adminUpdateBalance(@Req() req: any, @Body() body: { userId: string; amount: number; description: string; type: TransactionType }) {
    // In a real app, use a dedicated AdminGuard
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return this.walletService.adminUpdateBalance(
      body.userId,
      body.amount,
      body.description,
      body.type,
    );
  }
  @Get('admin/withdrawals')
  async getWithdrawalRequests(@Req() req: any) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return this.walletService.getWithdrawalRequests();
  }

  @Post('admin/withdrawals/:id/approve')
  async approveWithdrawal(@Req() req: any, @Param('id') withdrawalId: string) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return this.walletService.approveWithdrawal(withdrawalId);
  }

  @Post('admin/withdrawals/:id/reject')
  async rejectWithdrawal(@Req() req: any, @Param('id') withdrawalId: string, @Body() body: { reason: string }) {
    if (req.user.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    return this.walletService.rejectWithdrawal(withdrawalId, body.reason || 'Rejected by admin');
  }
}
