"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const config_1 = require("@nestjs/config");
const payment_entity_1 = require("../entities/payment.entity");
const order_entity_1 = require("../entities/order.entity");
let PaymentsService = class PaymentsService {
    paymentRepository;
    orderRepository;
    configService;
    constructor(paymentRepository, orderRepository, configService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.configService = configService;
    }
    async createPayment(orderId, method) {
        const order = await this.orderRepository.findOne({ where: { id: orderId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        const existingPayment = await this.paymentRepository.findOne({
            where: { orderId, status: payment_entity_1.PaymentStatus.PENDING },
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
    async initiatePayment(payment) {
        switch (payment.method) {
            case payment_entity_1.PaymentMethod.STRIPE:
                return this.initiateStripePayment(payment);
            case payment_entity_1.PaymentMethod.SSLCOMMERZ:
                return this.initiateSslcommerzPayment(payment);
            case payment_entity_1.PaymentMethod.BKASH:
                return this.initiateBkashPayment(payment);
            case payment_entity_1.PaymentMethod.NAGAD:
                return this.initiateNagadPayment(payment);
            default:
                throw new common_1.BadRequestException('Invalid payment method');
        }
    }
    async initiateStripePayment(payment) {
        const stripeSecretKey = this.configService.get('stripe.secretKey');
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
            success_url: `${this.configService.get('frontendUrl')}/orders/${payment.orderId}/success`,
            cancel_url: `${this.configService.get('frontendUrl')}/orders/${payment.orderId}/cancel`,
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
    async initiateSslcommerzPayment(payment) {
        const storeId = this.configService.get('sslcommerz.storeId');
        const storePassword = this.configService.get('sslcommerz.storePassword');
        if (!storeId || storeId === 'your-store-id') {
            return {
                paymentId: payment.id,
                url: null,
                message: 'SSLCommerz not configured. In test mode.',
            };
        }
        const order = await this.orderRepository.findOne({ where: { id: payment.orderId } });
        const postData = {
            store_id: storeId,
            store_passwd: storePassword,
            total_amount: payment.amount,
            currency: 'BDT',
            tran_id: payment.id,
            success_url: `${this.configService.get('frontendUrl')}/api/payments/sslcommerz/success`,
            fail_url: `${this.configService.get('frontendUrl')}/api/payments/sslcommerz/fail`,
            cancel_url: `${this.configService.get('frontendUrl')}/api/payments/sslcommerz/cancel`,
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
            return new Promise((resolve) => {
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        try {
                            const response = JSON.parse(data);
                            resolve({
                                paymentId: payment.id,
                                url: response.GatewayPageURL,
                            });
                        }
                        catch {
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
        }
        catch {
            return {
                paymentId: payment.id,
                url: null,
                message: 'Failed to initiate SSLCommerz payment',
            };
        }
    }
    async initiateBkashPayment(payment) {
        const appKey = this.configService.get('bkash.appKey');
        const appSecret = this.configService.get('bkash.appSecret');
        if (!appKey || appKey === 'your-app-key') {
            return {
                paymentId: payment.id,
                url: null,
                message: 'bKash not configured. In test mode.',
            };
        }
        try {
            const https = require('https');
            const tokenResponse = await new Promise((resolve) => {
                const authData = JSON.stringify({ app_key: appKey, app_secret: appSecret });
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
                const req = https.request(options, (res) => {
                    let data = '';
                    res.on('data', (chunk) => { data += chunk; });
                    res.on('end', () => {
                        try {
                            resolve(JSON.parse(data));
                        }
                        catch {
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
        }
        catch {
            return {
                paymentId: payment.id,
                url: null,
                message: 'Failed to initiate bKash payment',
            };
        }
    }
    async initiateNagadPayment(payment) {
        const merchantId = this.configService.get('nagad.merchantId');
        const merchantKey = this.configService.get('nagad.merchantKey');
        if (!merchantId || merchantId === 'your-merchant-id') {
            return {
                paymentId: payment.id,
                url: null,
                message: 'Nagad not configured. In test mode.',
            };
        }
        const timestamp = new Date().getTime().toString();
        const suffix = timestamp;
        const order = await this.orderRepository.findOne({ where: { id: payment.orderId } });
        const requestBody = {
            merchantId,
            orderId: `ORDER-${payment.id}`,
            currencyCode: '050',
            amount: payment.amount.toString(),
            orderType: 'ecommerce',
            callbackUrl: `${this.configService.get('frontendUrl')}/api/payments/nagad/callback`,
            merchantCallbackUrl: `${this.configService.get('frontendUrl')}/api/payments/nagad/callback`,
            productDescription: `Order ${order?.orderNumber || payment.orderId}`,
            customerName: order?.shippingAddress?.name || 'Customer',
            customerMobile: order?.shippingAddress?.phone || '01700000000',
        };
        const httpClient = require('axios');
        try {
            const response = await httpClient.post('https://sandbox.mynagad.com/api/checkout/initialize', requestBody, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-Request-Id': suffix,
                },
            });
            payment.transactionId = response.data?.transactionId || `NAGAD-${payment.id}`;
            await this.paymentRepository.save(payment);
            return {
                paymentId: payment.id,
                url: response.data?.callBackUrl || null,
                transactionId: payment.transactionId,
            };
        }
        catch {
            return {
                paymentId: payment.id,
                url: null,
                message: 'Failed to initiate Nagad payment',
            };
        }
    }
    async confirmPayment(paymentId, transactionId) {
        const payment = await this.paymentRepository.findOne({ where: { id: paymentId } });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        payment.status = payment_entity_1.PaymentStatus.COMPLETED;
        payment.transactionId = transactionId || payment.transactionId;
        await this.paymentRepository.save(payment);
        const order = await this.orderRepository.findOne({ where: { id: payment.orderId } });
        if (order) {
            order.paymentStatus = order_entity_1.PaymentStatus.PAID;
            order.status = order_entity_1.OrderStatus.CONFIRMED;
            await this.orderRepository.save(order);
        }
        return { message: 'Payment confirmed successfully' };
    }
    async handleStripeWebhook(payload, signature) {
        const webhookSecret = this.configService.get('stripe.webhookSecret');
        if (webhookSecret && webhookSecret !== 'your-webhook-secret') {
            const Stripe = require('stripe');
            const stripe = new Stripe(this.configService.get('stripe.secretKey'));
            try {
                const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
                if (event.type === 'checkout.session.completed') {
                    const session = event.data.object;
                    const paymentId = session.metadata?.paymentId;
                    if (paymentId) {
                        await this.confirmPayment(paymentId, session.id);
                    }
                }
                return { received: true };
            }
            catch {
                throw new common_1.HttpException('Webhook signature verification failed', common_1.HttpStatus.BAD_REQUEST);
            }
        }
        return { received: true };
    }
    async handleSslcommerzSuccess(data) {
        const payment = await this.paymentRepository.findOne({
            where: { id: data.tran_id },
        });
        if (payment && data.status === 'VALID') {
            await this.confirmPayment(payment.id, data.bank_tran_id);
        }
        return { message: 'Payment successful' };
    }
    async handleBkashWebhook(data) {
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
    async handleNagadWebhook(data) {
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
    async getPaymentByOrder(orderId) {
        const payment = await this.paymentRepository.findOne({ where: { orderId } });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(1, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map