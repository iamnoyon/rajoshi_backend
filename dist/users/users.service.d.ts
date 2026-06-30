import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
export declare class UsersService {
    private userRepository;
    constructor(userRepository: Repository<User>);
    findAll(page?: number, limit?: number): Promise<{
        content: {
            id: string;
            name: string;
            email: string;
            phone: string;
            avatar: string;
            isActive: boolean;
            role: UserRole;
            isEmailVerified: boolean;
            createdAt: Date;
            updatedAt: Date;
            orders: import("../entities/order.entity").Order[];
            reviews: import("../entities/review.entity").Review[];
            wishlist: import("../entities/wishlist.entity").Wishlist[];
            cart: import("../entities/cart.entity").Cart[];
            addresses: import("../entities/address.entity").Address[];
        }[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
        isActive: boolean;
        role: UserRole;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        orders: import("../entities/order.entity").Order[];
        reviews: import("../entities/review.entity").Review[];
        wishlist: import("../entities/wishlist.entity").Wishlist[];
        cart: import("../entities/cart.entity").Cart[];
        addresses: import("../entities/address.entity").Address[];
    }>;
    update(id: string, dto: Partial<User>): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
        isActive: boolean;
        role: UserRole;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        orders: import("../entities/order.entity").Order[];
        reviews: import("../entities/review.entity").Review[];
        wishlist: import("../entities/wishlist.entity").Wishlist[];
        cart: import("../entities/cart.entity").Cart[];
        addresses: import("../entities/address.entity").Address[];
    }>;
    remove(id: string): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        total: number;
        active: number;
        admins: number;
    }>;
}
