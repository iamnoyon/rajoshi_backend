import { Category } from './category.entity';
import { ProductImage } from './product-image.entity';
import { OrderItem } from './order-item.entity';
import { Review } from './review.entity';
export declare class Product {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    discountPrice: number;
    stock: number;
    sku: string;
    shortnote: string;
    features: string[];
    images: string[];
    isActive: boolean;
    isFeatured: boolean;
    categoryId: string;
    category: Category;
    productImages: ProductImage[];
    orderItems: OrderItem[];
    reviews: Review[];
    createdAt: Date;
    updatedAt: Date;
}
