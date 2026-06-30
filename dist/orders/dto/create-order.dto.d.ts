declare class OrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: OrderItemDto[];
    couponCode?: string;
    shippingAddress: Record<string, any>;
    billingAddress?: Record<string, any>;
    deliveryMethod?: string;
    paymentMethod: string;
}
export {};
