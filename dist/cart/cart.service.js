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
exports.CartService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const cart_entity_1 = require("../entities/cart.entity");
const product_entity_1 = require("../entities/product.entity");
const coupon_entity_1 = require("../entities/coupon.entity");
const coupon_entity_2 = require("../entities/coupon.entity");
let CartService = class CartService {
    cartRepository;
    productRepository;
    couponRepository;
    constructor(cartRepository, productRepository, couponRepository) {
        this.cartRepository = cartRepository;
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
    }
    async getCart(userId) {
        const items = await this.cartRepository.find({
            where: { userId },
            relations: ['product', 'product.productImages', 'product.category'],
            order: { createdAt: 'DESC' },
        });
        const subtotal = items.reduce((sum, item) => {
            const price = item.product.discountPrice || item.product.price;
            return sum + Number(price) * item.quantity;
        }, 0);
        return {
            items,
            subtotal,
            totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        };
    }
    async addToCart(userId, dto) {
        const product = await this.productRepository.findOne({
            where: { id: dto.productId },
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (!product.isActive) {
            throw new common_1.BadRequestException('Product is not available');
        }
        if (product.stock < dto.quantity) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        let cartItem = await this.cartRepository.findOne({
            where: { userId, productId: dto.productId },
        });
        if (cartItem) {
            cartItem.quantity += dto.quantity;
            if (cartItem.quantity > product.stock) {
                throw new common_1.BadRequestException('Insufficient stock');
            }
        }
        else {
            cartItem = this.cartRepository.create({
                userId,
                productId: dto.productId,
                quantity: dto.quantity,
            });
        }
        await this.cartRepository.save(cartItem);
        return this.getCart(userId);
    }
    async updateCartItem(userId, productId, dto) {
        const cartItem = await this.cartRepository.findOne({
            where: { userId, productId },
            relations: ['product'],
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        if (dto.quantity > cartItem.product.stock) {
            throw new common_1.BadRequestException('Insufficient stock');
        }
        cartItem.quantity = dto.quantity;
        await this.cartRepository.save(cartItem);
        return this.getCart(userId);
    }
    async removeFromCart(userId, productId) {
        const cartItem = await this.cartRepository.findOne({
            where: { userId, productId },
        });
        if (!cartItem) {
            throw new common_1.NotFoundException('Cart item not found');
        }
        await this.cartRepository.remove(cartItem);
        return this.getCart(userId);
    }
    async clearCart(userId) {
        await this.cartRepository.delete({ userId });
        return { message: 'Cart cleared' };
    }
    async applyCoupon(userId, code) {
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
        const cart = await this.getCart(userId);
        if (coupon.minOrder && cart.subtotal < coupon.minOrder) {
            throw new common_1.BadRequestException(`Minimum order amount of ${coupon.minOrder} required`);
        }
        let discount = 0;
        if (coupon.type === coupon_entity_2.CouponType.PERCENTAGE) {
            discount = (cart.subtotal * Number(coupon.value)) / 100;
        }
        else {
            discount = Number(coupon.value);
        }
        discount = Math.min(discount, cart.subtotal);
        return {
            coupon: coupon.code,
            discount,
            subtotal: cart.subtotal,
            total: cart.subtotal - discount,
        };
    }
};
exports.CartService = CartService;
exports.CartService = CartService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(2, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CartService);
//# sourceMappingURL=cart.service.js.map