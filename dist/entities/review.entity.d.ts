import { User } from './user.entity';
import { Product } from './product.entity';
export declare class Review {
    id: string;
    rating: number;
    comment: string;
    isApproved: boolean;
    userId: string;
    user: User;
    productId: string;
    product: Product;
    createdAt: Date;
    updatedAt: Date;
}
