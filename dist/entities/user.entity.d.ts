import { Order } from './order.entity';
import { Review } from './review.entity';
import { Wishlist } from './wishlist.entity';
import { Cart } from './cart.entity';
import { Address } from './address.entity';
export declare enum UserRole {
    CUSTOMER = "customer",
    ADMIN = "admin"
}
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    phone: string;
    avatar: string;
    isActive: boolean;
    role: UserRole;
    refreshToken: string;
    emailVerificationToken: string;
    isEmailVerified: boolean;
    passwordResetToken: string;
    passwordResetExpires: Date;
    createdAt: Date;
    updatedAt: Date;
    orders: Order[];
    reviews: Review[];
    wishlist: Wishlist[];
    cart: Cart[];
    addresses: Address[];
}
