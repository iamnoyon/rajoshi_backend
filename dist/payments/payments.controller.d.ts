import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
    createPayment(orderId: string, dto: CreatePaymentDto): Promise<any>;
    confirmPayment(paymentId: string, transactionId: string): Promise<{
        message: string;
    }>;
    getPaymentByOrder(orderId: string): Promise<import("../entities/payment.entity").Payment>;
    handleStripeWebhook(req: Request, signature: string): Promise<{
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
}
