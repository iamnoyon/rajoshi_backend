import { User } from './user.entity';
import { OrderItem } from './order-item.entity';
import { Payment } from './payment.entity';
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    PACKED = "packed",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded"
}
export declare class Order {
    id: string;
    orderNumber: string;
    subtotal: number;
    shipping: number;
    discount: number;
    total: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    userId: string;
    user: User;
    shippingAddress: Record<string, any>;
    billingAddress: Record<string, any>;
    deliveryMethod: string;
    paymentMethod: string;
    items: OrderItem[];
    payment: Payment;
    createdAt: Date;
    updatedAt: Date;
}
