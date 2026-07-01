import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from '../entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { MailService } from '../mail/mail.service';
export declare class AuthService {
    private userRepository;
    private jwtService;
    private configService;
    private mailService;
    private readonly logger;
    constructor(userRepository: Repository<User>, jwtService: JwtService, configService: ConfigService, mailService: MailService);
    validateUser(email: string, password: string): Promise<User | null>;
    register(dto: RegisterDto): Promise<{
        user: {
            id: string;
            name: string;
            email: string;
            role: UserRole;
        };
        message: string;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            name: string;
            email: string;
            role: UserRole;
        };
    }>;
    refresh(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    logout(userId: string): Promise<{
        message: string;
    }>;
    forgotPassword(email: string): Promise<{
        resetToken: string;
    }>;
    resetPassword(token: string, password: string): Promise<{
        message: string;
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
    }>;
    getProfile(userId: string): Promise<{
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
    updateProfile(userId: string, dto: UpdateProfileDto): Promise<{
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
    private generateTokens;
    private updateRefreshToken;
}
