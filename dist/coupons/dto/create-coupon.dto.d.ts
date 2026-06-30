import { CouponType } from '../../entities/coupon.entity';
export declare class CreateCouponDto {
    code: string;
    type: CouponType;
    value: number;
    minOrder?: number;
    maxUses?: number;
    isActive?: boolean;
    expiresAt?: Date;
}
