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
let CouponsService = class CouponsService {
    couponRepository;
    constructor(couponRepository) {
        this.couponRepository = couponRepository;
    }
    async findAll(page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [coupons, total] = await this.couponRepository.findAndCount({
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            data: coupons,
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
        const coupon = await this.couponRepository.findOne({ where: { code } });
        if (!coupon) {
            throw new common_1.NotFoundException('Coupon not found');
        }
        return coupon;
    }
    async create(dto) {
        const existing = await this.couponRepository.findOne({ where: { code: dto.code } });
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
            const existing = await this.couponRepository.findOne({ where: { code: dto.code } });
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
        const coupon = await this.couponRepository.findOne({ where: { code, isActive: true } });
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
};
exports.CouponsService = CouponsService;
exports.CouponsService = CouponsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CouponsService);
//# sourceMappingURL=coupons.service.js.map