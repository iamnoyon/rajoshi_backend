import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
export declare class CouponsService {
    private couponRepository;
    constructor(couponRepository: Repository<Coupon>);
    findAll(page?: number, limit?: number): Promise<{
        data: Coupon[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Coupon>;
    findByCode(code: string): Promise<Coupon>;
    create(dto: CreateCouponDto): Promise<Coupon>;
    update(id: string, dto: UpdateCouponDto): Promise<Coupon>;
    remove(id: string): Promise<{
        message: string;
    }>;
    validateCoupon(code: string, orderTotal: number): Promise<{
        valid: boolean;
        coupon: Coupon;
    }>;
}
