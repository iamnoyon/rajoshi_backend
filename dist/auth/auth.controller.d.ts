import type { Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto, res: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: import("../entities/user.entity").UserRole;
        };
    }>;
    refresh(req: any, res: Response): Promise<{
        message: string;
    }>;
    logout(userId: string, res: Response): Promise<{
        message: string;
    }>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        resetToken: string;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    verifyEmail(dto: VerifyEmailDto): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
        isActive: boolean;
        role: import("../entities/user.entity").UserRole;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        orders: import("../entities/order.entity").Order[];
        reviews: import("../entities/review.entity").Review[];
        wishlist: import("../entities/wishlist.entity").Wishlist[];
        cart: import("../entities/cart.entity").Cart[];
        addresses: import("../entities/address.entity").Address[];
    }>;
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
        id: string;
        name: string;
        email: string;
        phone: string;
        avatar: string;
        isActive: boolean;
        role: import("../entities/user.entity").UserRole;
        isEmailVerified: boolean;
        createdAt: Date;
        updatedAt: Date;
        orders: import("../entities/order.entity").Order[];
        reviews: import("../entities/review.entity").Review[];
        wishlist: import("../entities/wishlist.entity").Wishlist[];
        cart: import("../entities/cart.entity").Cart[];
        addresses: import("../entities/address.entity").Address[];
    }>;
}
