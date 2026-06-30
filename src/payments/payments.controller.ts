import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Req,
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { PaymentMethod } from '../entities/payment.entity';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post(':orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create payment for order' })
  createPayment(
    @Param('orderId') orderId: string,
    @Body('method') method: PaymentMethod,
  ) {
    return this.paymentsService.createPayment(orderId, method);
  }

  @Post(':paymentId/confirm')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Confirm payment' })
  confirmPayment(
    @Param('paymentId') paymentId: string,
    @Body('transactionId') transactionId: string,
  ) {
    return this.paymentsService.confirmPayment(paymentId, transactionId);
  }

  @Get('order/:orderId')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by order' })
  getPaymentByOrder(@Param('orderId') orderId: string) {
    return this.paymentsService.getPaymentByOrder(orderId);
  }

  @Public()
  @Post('stripe/webhook')
  @ApiOperation({ summary: 'Stripe webhook endpoint' })
  handleStripeWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') signature: string,
  ) {
    return this.paymentsService.handleStripeWebhook(req.body, signature);
  }

  @Public()
  @Post('sslcommerz/success')
  @ApiOperation({ summary: 'SSLCommerz success callback' })
  handleSslcommerzSuccess(@Body() data: any) {
    return this.paymentsService.handleSslcommerzSuccess(data);
  }

  @Public()
  @Post('bkash/webhook')
  @ApiOperation({ summary: 'bKash webhook endpoint' })
  handleBkashWebhook(@Body() data: any) {
    return this.paymentsService.handleBkashWebhook(data);
  }

  @Public()
  @Post('nagad/webhook')
  @ApiOperation({ summary: 'Nagad webhook endpoint' })
  handleNagadWebhook(@Body() data: any) {
    return this.paymentsService.handleNagadWebhook(data);
  }
}
