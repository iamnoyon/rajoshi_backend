"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CouponsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const coupon_entity_1 = require("../entities/coupon.entity");
const product_entity_1 = require("../entities/product.entity");
let CouponsService = class CouponsService {
    couponRepository;
    productRepository;
    constructor(couponRepository, productRepository) {
        this.couponRepository = couponRepository;
        this.productRepository = productRepository;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [coupons, total] = await this.couponRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            content: coupons,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        return coupon;
    }
    async findByCode(code) {
        const coupon = await this.couponRepository.findOne({ where: { code, isActive: true } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Coupon has expired');
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new common_1.BadRequestException('Coupon usage limit reached');
        }
        return {
            code: coupon.code,
            type: coupon.type,
            value: Number(coupon.value),
            minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
            expiresAt: coupon.expiresAt,
            description: coupon.type === 'percentage'
                ? `${coupon.value}% off`
                : `Flat ${coupon.value} off`,
        };
    }
    async create(dto) {
        const existing = await this.couponRepository.findOne({
            where: { code: dto.code },
        });
        if (existing) {
            throw new common_1.ConflictException('Coupon code already exists');
        }
        const coupon = this.couponRepository.create(dto);
        return this.couponRepository.save(coupon);
    }
    async update(id, dto) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        if (dto.code && dto.code !== coupon.code) {
            const existing = await this.couponRepository.findOne({
                where: { code: dto.code },
            });
            if (existing) {
                throw new common_1.ConflictException('Coupon code already exists');
            }
        }
        Object.assign(coupon, dto);
        return this.couponRepository.save(coupon);
    }
    async remove(id) {
        const coupon = await this.couponRepository.findOne({ where: { id } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        await this.couponRepository.remove(coupon);
        return { message: 'Coupon deleted successfully' };
    }
    async validateCoupon(code, orderTotal) {
        const coupon = await this.couponRepository.findOne({
            where: { code, isActive: true },
        });
        if (!coupon) {
            throw new common_1.NotFoundException('Invalid coupon code');
        }
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Coupon has expired');
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
            throw new common_1.BadRequestException('Coupon usage limit reached');
        }
        if (coupon.minOrder && orderTotal < coupon.minOrder) {
            throw new common_1.BadRequestException(`Minimum order amount of ${coupon.minOrder} required`);
        }
        return { valid: true, coupon };
    }
    async findAvailableCoupons() {
        const coupons = await this.couponRepository
            .createQueryBuilder('coupon')
            .where('coupon.isActive = :isActive', { isActive: true })
            .andWhere('(coupon.expiresAt IS NULL OR coupon.expiresAt > :now)', { now: new Date() })
            .andWhere('(coupon.maxUses IS NULL OR coupon.usedCount < coupon.maxUses)')
            .orderBy('coupon.createdAt', 'DESC')
            .getMany();
        return coupons.map((coupon) => ({
            code: coupon.code,
            type: coupon.type,
            value: Number(coupon.value),
            minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
            expiresAt: coupon.expiresAt,
            description: coupon.type === 'percentage'
                ? `${coupon.value}% off`
                : `Flat ${coupon.value} off`,
            remainingUses: coupon.maxUses !== null ? coupon.maxUses - coupon.usedCount : null,
        }));
    }
    async previewOrder(dto) {
        const previewItems = [];
        let subtotal = 0;
        for (const item of dto.items) {
            const product = await this.productRepository.findOne({
                where: { id: item.productId },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            }
            if (!product.isActive) {
                throw new common_1.BadRequestException(`Product ${product.name} is not available`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const unitPrice = Number(product.discountPrice || product.price);
            const lineTotal = unitPrice * item.quantity;
            subtotal += lineTotal;
            previewItems.push({
                productId: product.id,
                name: product.name,
                slug: product.slug,
                quantity: item.quantity,
                unitPrice,
                lineTotal,
            });
        }
        let discount = 0;
        let couponCode = null;
        if (dto.couponCode) {
            const coupon = await this.couponRepository.findOne({
                where: { code: dto.couponCode, isActive: true },
            });
            if (!coupon) {
                throw new common_1.BadRequestException('Invalid coupon code');
            }
            if (coupon.expiresAt && coupon.expiresAt < new Date()) {
                throw new common_1.BadRequestException('Coupon has expired');
            }
            if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                throw new common_1.BadRequestException('Coupon usage limit reached');
            }
            if (coupon.minOrder && subtotal < coupon.minOrder) {
                throw new common_1.BadRequestException(`Minimum order of ${coupon.minOrder} required`);
            }
            discount =
                coupon.type === coupon_entity_1.CouponType.PERCENTAGE
                    ? (subtotal * Number(coupon.value)) / 100
                    : Number(coupon.value);
            discount = Math.min(discount, subtotal);
            couponCode = coupon.code;
        }
        return {
            items: previewItems,
            subtotal,
            coupon: couponCode,
            discount,
            total: subtotal - discount,
        };
    }
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map