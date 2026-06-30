import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { UserRole } from '../entities/user.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findAll(query: PaginationDto): Promise<{
        data: {
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
    getStats(): Promise<{
        total: number;
        active: number;
        admins: number;
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
}
