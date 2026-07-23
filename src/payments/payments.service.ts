import {
  Injectable,
  NotFoundException,
  BadRequestException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from '../entities/payment.entity';
import {
  Order,
  OrderStatus,
  PaymentStatus as OrderPaymentStatus,
} from '../entities/order.entity';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private configService: ConfigService,
  ) {}

  async createPayment(orderId: string, method: PaymentMethod) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    const existingPayment = await this.paymentRepository.findOne({
      where: { orderId, status: PaymentStatus.PENDING },
    });
    if (existingPayment) {
      return this.initiatePayment(existingPayment);
    }

    const payment = this.paymentRepository.create({
      amount: Number(order.total),
      method,
      orderId,
    });

    const savedPayment = await this.paymentRepository.save(payment);
    return this.initiatePayment(savedPayment);
  }

  private async initiatePayment(payment: Payment) {
    switch (payment.method) {
      case PaymentMethod.STRIPE:
        return this.initiateStripePayment(payment);
      case PaymentMethod.SSLCOMMERZ:
        return this.initiateSslcommerzPayment(payment);
      case PaymentMethod.BKASH:
        return this.initiateBkashPayment(payment);
      case PaymentMethod.NAGAD:
        return this.initiateNagadPayment(payment);
      default:
        throw new BadRequestException('Invalid payment method');
    }
  }

  private async initiateStripePayment(payment: Payment) {
    const stripeSecretKey = this.configService.get<string>('stripe.secretKey');
    if (!stripeSecretKey || stripeSecretKey === 'your-stripe-secret') {
      return {
        paymentId: payment.id,
        url: null,
        message: 'Stripe not configured. In test mode.',
      };
    }

    const Stripe = require('stripe');
    const stripe = new Stripe(stripeSecretKey);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Order #${payment.orderId}` },
            unit_amount: Math.round(Number(payment.amount) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${this.configService.get<string>('frontendUrl')}/orders/${payment.orderId}/success`,
      cancel_url: `${this.configService.get<string>('frontendUrl')}/orders/${payment.orderId}/cancel`,
      metadata: { paymentId: payment.id, orderId: payment.orderId },
    });

    payment.transactionId = session.id;
    await this.paymentRepository.save(payment);

    return {
      paymentId: payment.id,
      url: session.url,
      sessionId: session.id,
    };
  }

  private async initiateSslcommerzPayment(payment: Payment) {
    const storeId = this.configService.get<string>('sslcommerz.storeId');
    const storePassword = this.configService.get<string>(
      'sslcommerz.storePassword',
    );

    if (!storeId || storeId === 'your-store-id') {
      return {
        paymentId: payment.id,
        url: null,
        message: 'SSLCommerz not configured. In test mode.',
      };
    }

    const order = await this.orderRepository.findOne({
      where: { id: payment.orderId },
    });
    const postData = {
      store_id: storeId,
      store_passwd: storePassword,
      total_amount: payment.amount,
      currency: 'BDT',
      tran_id: payment.id,
      success_url: `${this.configService.get<string>('frontendUrl')}/api/payments/sslcommerz/success`,
      fail_url: `${this.configService.get<string>('frontendUrl')}/api/payments/sslcommerz/fail`,
      cancel_url: `${this.configService.get<string>('frontendUrl')}/api/payments/sslcommerz/cancel`,
      cus_name: order?.shippingAddress?.name || 'Customer',
      cus_email: order?.user?.email || 'customer@example.com',
      cus_phone: order?.shippingAddress?.phone || '01700000000',
      product_name: `Order ${order?.orderNumber}`,
      product_category: 'Ecommerce',
      product_profile: 'general',
    };

    try {
      const https = require('https');
      const querystring = require('querystring');

      const formData = querystring.stringify(postData);
      const options = {
        hostname: 'sandbox.sslcommerz.com',
        port: 443,
        path: '/gwprocess/v4/api.php',
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': formData.length,
        },
      };

      return new Promise<any>((resolve) => {
        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              const response = JSON.parse(data);
              resolve({
                paymentId: payment.id,
                url: response.GatewayPageURL,
              });
            } catch {
              resolve({
                paymentId: payment.id,
                url: null,
                message: 'Failed to initiate SSLCommerz payment',
              });
            }
          });
        });
        req.on('error', () => {
          resolve({
            paymentId: payment.id,
            url: null,
            message: 'Failed to connect to SSLCommerz',
          });
        });
        req.write(formData);
        req.end();
      });
    } catch {
      return {
        paymentId: payment.id,
        url: null,
        message: 'Failed to initiate SSLCommerz payment',
      };
    }
  }

  private async initiateBkashPayment(payment: Payment) {
    const appKey = this.configService.get<string>('bkash.appKey');
    const appSecret = this.configService.get<string>('bkash.appSecret');

    if (!appKey || appKey === 'your-app-key') {
      return {
        paymentId: payment.id,
        url: null,
        message: 'bKash not configured. In test mode.',
      };
    }

    try {
      const https = require('https');

      const tokenResponse = await new Promise<any>((resolve) => {
        const authData = JSON.stringify({
          app_key: appKey,
          app_secret: appSecret,
        });
        const options = {
          hostname: 'tokenized.sandbox.bka.sh',
          port: 443,
          path: '/v1.2.0-beta/tokenized/checkout/token/grant',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': authData.length,
          },
        };

        const req = https.request(options, (res: any) => {
          let data = '';
          res.on('data', (chunk: string) => {
            data += chunk;
          });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve(null);
            }
          });
        });
        req.on('error', () => resolve(null));
        req.write(authData);
        req.end();
      });

      payment.transactionId = `BKASH-${payment.id}`;
      await this.paymentRepository.save(payment);

      return {
        paymentId: payment.id,
        token: tokenResponse.id_token,
        message: 'bKash payment initiated',
      };
    } catch {
      return {
        paymentId: payment.id,
        url: null,
        message: 'Failed to initiate bKash payment',
      };
    }
  }

  private async initiateNagadPayment(payment: Payment) {
    const merchantId = this.configService.get<string>('nagad.merchantId');
    const merchantKey = this.configService.get<string>('nagad.merchantKey');

    if (!merchantId || merchantId === 'your-merchant-id') {
      return {
        paymentId: payment.id,
        url: null,
        message: 'Nagad not configured. In test mode.',
      };
    }

    const timestamp = new Date().getTime().toString();
    const suffix = timestamp;

    const order = await this.orderRepository.findOne({
      where: { id: payment.orderId },
    });

    const requestBody = {
      merchantId,
      orderId: `ORDER-${payment.id}`,
      currencyCode: '050',
      amount: payment.amount.toString(),
      orderType: 'ecommerce',
      callbackUrl: `${this.configService.get<string>('frontendUrl')}/api/payments/nagad/callback`,
      merchantCallbackUrl: `${this.configService.get<string>('frontendUrl')}/api/payments/nagad/callback`,
      productDescription: `Order ${order?.orderNumber || payment.orderId}`,
      customerName: order?.shippingAddress?.name || 'Customer',
      customerMobile: order?.shippingAddress?.phone || '01700000000',
    };

    const httpClient = require('axios');

    try {
      const response = await httpClient.post(
        'https://sandbox.mynagad.com/api/checkout/initialize',
        requestBody,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Id': suffix,
          },
        },
      );

      payment.transactionId =
        response.data?.transactionId || `NAGAD-${payment.id}`;
      await this.paymentRepository.save(payment);

      return {
        paymentId: payment.id,
        url: response.data?.callBackUrl || null,
        transactionId: payment.transactionId,
      };
    } catch {
      return {
        paymentId: payment.id,
        url: null,
        message: 'Failed to initiate Nagad payment',
      };
    }
  }

  async confirmPayment(paymentId: string, transactionId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.COMPLETED;
    payment.transactionId = transactionId || payment.transactionId;
    await this.paymentRepository.save(payment);

    const order = await this.orderRepository.findOne({
      where: { id: payment.orderId },
    });
    if (order) {
      order.paymentStatus = OrderPaymentStatus.PAID;
      order.status = OrderStatus.CONFIRMED;
      await this.orderRepository.save(order);
    }

    return { message: 'Payment confirmed successfully' };
  }

  async handleStripeWebhook(payload: any, signature: string) {
    const webhookSecret = this.configService.get<string>(
      'stripe.webhookSecret',
    );
    if (webhookSecret && webhookSecret !== 'your-webhook-secret') {
      const Stripe = require('stripe');
      const stripe = new Stripe(
        this.configService.get<string>('stripe.secretKey'),
      );
      try {
        const event = stripe.webhooks.constructEvent(
          payload,
          signature,
          webhookSecret,
        );
        if (event.type === 'checkout.session.completed') {
          const session = event.data.object;
          const paymentId = session.metadata?.paymentId;
          if (paymentId) {
            await this.confirmPayment(paymentId, session.id);
          }
        }
        return { received: true };
      } catch {
        throw new HttpException(
          'Webhook signature verification failed',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    return { received: true };
  }

  async handleSslcommerzSuccess(data: any) {
    const payment = await this.paymentRepository.findOne({
      where: { id: data.tran_id },
    });
    if (payment && data.status === 'VALID') {
      await this.confirmPayment(payment.id, data.bank_tran_id);
    }
    return { message: 'Payment successful' };
  }

  async handleBkashWebhook(data: any) {
    if (data.status === 'completed') {
      const payment = await this.paymentRepository.findOne({
        where: { transactionId: data.trxID },
      });
      if (payment) {
        await this.confirmPayment(payment.id, data.trxID);
      }
    }
    return { received: true };
  }

  async handleNagadWebhook(data: any) {
    if (data.status === 'Success') {
      const payment = await this.paymentRepository.findOne({
        where: { transactionId: data.transactionId },
      });
      if (payment) {
        await this.confirmPayment(payment.id, data.transactionId);
      }
    }
    return { received: true };
  }

  async getPaymentByOrder(orderId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { orderId },
    });
    if (!payment) {
      throw new NotFoundException('Payment not found');
    }
    return payment;
  }
}
