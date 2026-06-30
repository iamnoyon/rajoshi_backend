import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
import { ApplyCouponDto } from './dto/apply-coupon.dto';
export declare class CartController {
    private cartService;
    constructor(cartService: CartService);
    getCart(userId: string): Promise<{
        items: import("../entities/cart.entity").Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    addToCart(userId: string, dto: AddToCartDto): Promise<{
        items: import("../entities/cart.entity").Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    updateCartItem(userId: string, productId: string, dto: UpdateCartDto): Promise<{
        items: import("../entities/cart.entity").Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    removeFromCart(userId: string, productId: string): Promise<{
        items: import("../entities/cart.entity").Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    applyCoupon(userId: string, dto: ApplyCouponDto): Promise<{
        coupon: string;
        discount: number;
        subtotal: number;
        total: number;
    }>;
}
