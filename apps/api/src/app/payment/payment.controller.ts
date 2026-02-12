import { Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('setup-intent')
  @UseGuards(AuthGuard('jwt'))
  async createSetupIntent(
    @CurrentUser() user: { id: string; email: string; role: string },
  ) {
    return this.paymentService.createSetupIntent(user.id);
  }
}
