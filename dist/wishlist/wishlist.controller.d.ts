import { WishlistService } from './wishlist.service';
export declare class WishlistController {
    private wishlistService;
    constructor(wishlistService: WishlistService);
    findAll(userId: string): Promise<import("../entities/wishlist.entity").Wishlist[]>;
    add(userId: string, productId: string): Promise<import("../entities/wishlist.entity").Wishlist>;
    remove(userId: string, productId: string): Promise<{
        message: string;
    }>;
}
