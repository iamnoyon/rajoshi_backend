import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PreviewOrderDto } from './dto/preview-order.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class CouponsController {
    private couponsService;
    constructor(couponsService: CouponsService);
    findAll(query: PaginationDto): Promise<{
        content: import("../entities/coupon.entity").Coupon[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAvailableCoupons(): Promise<{
        code: string;
        type: import("../entities/coupon.entity").CouponType;
        value: number;
        minOrder: number | null;
        expiresAt: Date;
        description: string;
        remainingUses: number | null;
    }[]>;
    findByCode(code: string): Promise<{
        code: string;
        type: import("../entities/coupon.entity").CouponType;
        value: number;
        minOrder: number | null;
        expiresAt: Date;
        description: string;
    }>;
    findOne(id: string): Promise<import("../entities/coupon.entity").Coupon>;
    create(dto: CreateCouponDto): Promise<import("../entities/coupon.entity").Coupon>;
    update(id: string, dto: UpdateCouponDto): Promise<import("../entities/coupon.entity").Coupon>;
    remove(id: string): Promise<{
        message: string;
    }>;
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
    validateCoupon(code: string, orderTotal: number): Promise<{
        valid: boolean;
        coupon: import("../entities/coupon.entity").Coupon;
    }>;
}
