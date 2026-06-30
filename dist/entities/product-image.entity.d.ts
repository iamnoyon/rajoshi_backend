import { Product } from './product.entity';
export declare class ProductImage {
    id: string;
    url: string;
    publicId: string;
    isPrimary: boolean;
    productId: string;
    product: Product;
}
