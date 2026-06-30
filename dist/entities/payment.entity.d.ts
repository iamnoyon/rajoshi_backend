import { Order } from './order.entity';
export declare enum PaymentMethod {
    STRIPE = "stripe",
    SSLCOMMERZ = "sslcommerz",
    BKASH = "bkash",
    NAGAD = "nagad"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class Payment {
    id: string;
    amount: number;
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId: string;
    orderId: string;
    order: Order;
    createdAt: Date;
}
