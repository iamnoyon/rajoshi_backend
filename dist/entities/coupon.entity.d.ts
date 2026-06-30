export declare enum CouponType {
    PERCENTAGE = "percentage",
    FIXED = "fixed"
}
export declare class Coupon {
    id: string;
    code: string;
    type: CouponType;
    value: number;
    minOrder: number;
    maxUses: number;
    usedCount: number;
    isActive: boolean;
    expiresAt: Date;
    createdAt: Date;
}
