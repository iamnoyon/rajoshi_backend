import { Repository } from 'typeorm';
import { Coupon, CouponType } from '../entities/coupon.entity';
import { Product } from '../entities/product.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PreviewOrderDto } from './dto/preview-order.dto';
export declare class CouponsService {
    private couponRepository;
    private productRepository;
    constructor(couponRepository: Repository<Coupon>, productRepository: Repository<Product>);
    findAll(page?: number, limit?: number): Promise<{
        content: Coupon[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Coupon>;
    findByCode(code: string): Promise<{
        code: string;
        type: CouponType;
        value: number;
        minOrder: number | null;
        expiresAt: Date;
        description: string;
    }>;
    create(dto: CreateCouponDto): Promise<Coupon>;
    update(id: string, dto: UpdateCouponDto): Promise<Coupon>;
    remove(id: string): Promise<{
        message: string;
    }>;
    validateCoupon(code: string, orderTotal: number): Promise<{
        valid: boolean;
        coupon: Coupon;
    }>;
    findAvailableCoupons(): Promise<{
        code: string;
        type: CouponType;
        value: number;
        minOrder: number | null;
        expiresAt: Date;
        description: string;
        remainingUses: number | null;
    }[]>;
    previewOrder(dto: PreviewOrderDto): Promise<{
        items: {
            productId: string;
            name: string;
            slug: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }[];
        subtotal: number;
        coupon: string | null;
        discount: number;
        total: number;
    }>;
}
