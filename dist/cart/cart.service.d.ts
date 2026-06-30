import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';
import { Coupon } from '../entities/coupon.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';
export declare class CartService {
    private cartRepository;
    private productRepository;
    private couponRepository;
    constructor(cartRepository: Repository<Cart>, productRepository: Repository<Product>, couponRepository: Repository<Coupon>);
    getCart(userId: string): Promise<{
        items: Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    addToCart(userId: string, dto: AddToCartDto): Promise<{
        items: Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    updateCartItem(userId: string, productId: string, dto: UpdateCartDto): Promise<{
        items: Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    removeFromCart(userId: string, productId: string): Promise<{
        items: Cart[];
        subtotal: number;
        totalItems: number;
    }>;
    clearCart(userId: string): Promise<{
        message: string;
    }>;
    applyCoupon(userId: string, code: string): Promise<{
        coupon: string;
        discount: number;
        subtotal: number;
        total: number;
    }>;
}
