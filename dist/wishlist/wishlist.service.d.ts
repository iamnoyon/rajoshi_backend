import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Product } from '../entities/product.entity';
export declare class WishlistService {
    private wishlistRepository;
    private productRepository;
    constructor(wishlistRepository: Repository<Wishlist>, productRepository: Repository<Product>);
    findAll(userId: string): Promise<Wishlist[]>;
    add(userId: string, productId: string): Promise<Wishlist>;
    remove(userId: string, productId: string): Promise<{
        message: string;
    }>;
}
