import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Payment, PaymentMethod } from '../entities/payment.entity';
import { Order } from '../entities/order.entity';
export declare class PaymentsService {
    private paymentRepository;
    private orderRepository;
    private configService;
    constructor(paymentRepository: Repository<Payment>, orderRepository: Repository<Order>, configService: ConfigService);
    createPayment(orderId: string, method: PaymentMethod): Promise<any>;
    private initiatePayment;
    private initiateStripePayment;
    private initiateSslcommerzPayment;
    private initiateBkashPayment;
    private initiateNagadPayment;
    confirmPayment(paymentId: string, transactionId: string): Promise<{
        message: string;
    }>;
    handleStripeWebhook(payload: any, signature: string): Promise<{
        received: boolean;
    }>;
    handleSslcommerzSuccess(data: any): Promise<{
        message: string;
    }>;
    handleBkashWebhook(data: any): Promise<{
        received: boolean;
    }>;
    handleNagadWebhook(data: any): Promise<{
        received: boolean;
    }>;
    getPaymentByOrder(orderId: string): Promise<Payment>;
}
