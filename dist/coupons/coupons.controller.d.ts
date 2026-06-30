import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class CouponsController {
    private couponsService;
    constructor(couponsService: CouponsService);
    findAll(query: PaginationDto): Promise<{
        data: import("../entities/coupon.entity").Coupon[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("../entities/coupon.entity").Coupon>;
    findByCode(code: string): Promise<import("../entities/coupon.entity").Coupon>;
    create(dto: CreateCouponDto): Promise<import("../entities/coupon.entity").Coupon>;
    update(id: string, dto: UpdateCouponDto): Promise<import("../entities/coupon.entity").Coupon>;
    remove(id: string): Promise<{
        message: string;
    }>;
    validateCoupon(code: string, orderTotal: number): Promise<{
        valid: boolean;
        coupon: import("../entities/coupon.entity").Coupon;
    }>;
}
