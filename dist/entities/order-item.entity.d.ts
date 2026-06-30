import { Order } from './order.entity';
import { Product } from './product.entity';
export declare class OrderItem {
    id: string;
    quantity: number;
    price: number;
    orderId: string;
    order: Order;
    productId: string;
    product: Product;
}
