import { User } from './user.entity';
import { Product } from './product.entity';
export declare class Cart {
    id: string;
    userId: string;
    user: User;
    productId: string;
    product: Product;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}
