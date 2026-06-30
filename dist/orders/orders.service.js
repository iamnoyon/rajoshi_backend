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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const order_item_entity_1 = require("../entities/order-item.entity");
const product_entity_1 = require("../entities/product.entity");
const cart_entity_1 = require("../entities/cart.entity");
const coupon_entity_1 = require("../entities/coupon.entity");
let OrdersService = class OrdersService {
    orderRepository;
    orderItemRepository;
    productRepository;
    cartRepository;
    couponRepository;
    constructor(orderRepository, orderItemRepository, productRepository, cartRepository, couponRepository) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.cartRepository = cartRepository;
        this.couponRepository = couponRepository;
    }
    generateOrderNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `ORD-${timestamp}-${random}`;
    }
    async create(userId, dto) {
        const orderItems = [];
        let subtotal = 0;
        for (const item of dto.items) {
            const product = await this.productRepository.findOne({ where: { id: item.productId } });
            if (!product) {
                throw new common_1.NotFoundException(`Product ${item.productId} not found`);
            }
            if (!product.isActive) {
                throw new common_1.BadRequestException(`Product ${product.name} is not available`);
            }
            if (product.stock < item.quantity) {
                throw new common_1.BadRequestException(`Insufficient stock for ${product.name}`);
            }
            const price = product.discountPrice || product.price;
            subtotal += Number(price) * item.quantity;
            const orderItem = this.orderItemRepository.create({
                quantity: item.quantity,
                price: Number(price),
                productId: item.productId,
            });
            orderItems.push(orderItem);
            product.stock -= item.quantity;
            await this.productRepository.save(product);
        }
        let discount = 0;
        if (dto.couponCode) {
            const coupon = await this.couponRepository.findOne({
                where: { code: dto.couponCode, isActive: true },
            });
            if (coupon) {
                if (coupon.expiresAt && coupon.expiresAt < new Date()) {
                    throw new common_1.BadRequestException('Coupon has expired');
                }
                if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
                    throw new common_1.BadRequestException('Coupon usage limit reached');
                }
                if (coupon.minOrder && subtotal < coupon.minOrder) {
                    throw new common_1.BadRequestException(`Minimum order of ${coupon.minOrder} required`);
                }
                discount = coupon.type === coupon_entity_1.CouponType.PERCENTAGE
                    ? (subtotal * Number(coupon.value)) / 100
                    : Number(coupon.value);
                discount = Math.min(discount, subtotal);
                coupon.usedCount += 1;
                await this.couponRepository.save(coupon);
            }
        }
        const shipping = dto.deliveryMethod ? 100 : 0;
        const total = subtotal - discount + shipping;
        const order = this.orderRepository.create({
            orderNumber: this.generateOrderNumber(),
            subtotal,
            shipping,
            discount,
            total,
            userId,
            shippingAddress: dto.shippingAddress,
            billingAddress: dto.billingAddress || dto.shippingAddress,
            deliveryMethod: dto.deliveryMethod,
            paymentMethod: dto.paymentMethod,
            items: orderItems,
        });
        const savedOrder = await this.orderRepository.save(order);
        await this.cartRepository.delete({ userId });
        return this.findOne(savedOrder.id);
    }
    async findMyOrders(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [orders, total] = await this.orderRepository.findAndCount({
            where: { userId },
            relations: ['items', 'items.product', 'payment'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            data: orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findAll(page = 1, limit = 10, status) {
        const skip = (page - 1) * limit;
        const where = {};
        if (status)
            where.status = status;
        const [orders, total] = await this.orderRepository.findAndCount({
            where,
            relations: ['items', 'items.product', 'user', 'payment'],
            order: { createdAt: 'DESC' },
            skip,
            take: limit,
        });
        return {
            data: orders,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['items', 'items.product', 'items.product.productImages', 'user', 'payment'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async findByOrderNumber(orderNumber) {
        const order = await this.orderRepository.findOne({
            where: { orderNumber },
            relations: ['items', 'items.product', 'user', 'payment'],
        });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        return order;
    }
    async updateStatus(id, dto) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        order.status = dto.status;
        if (dto.status === order_entity_1.OrderStatus.CANCELLED) {
            await this.restoreStock(order.id);
        }
        return this.orderRepository.save(order);
    }
    async cancelOrder(userId, id) {
        const order = await this.orderRepository.findOne({ where: { id, userId } });
        if (!order) {
            throw new common_1.NotFoundException('Order not found');
        }
        if (order.status !== order_entity_1.OrderStatus.PENDING && order.status !== order_entity_1.OrderStatus.CONFIRMED) {
            throw new common_1.BadRequestException('Order cannot be cancelled at this stage');
        }
        order.status = order_entity_1.OrderStatus.CANCELLED;
        await this.restockOrderItems(order.id);
        return this.orderRepository.save(order);
    }
    async restockOrderItems(orderId) {
        const items = await this.orderItemRepository.find({ where: { orderId } });
        for (const item of items) {
            const product = await this.productRepository.findOne({ where: { id: item.productId } });
            if (product) {
                product.stock += item.quantity;
                await this.productRepository.save(product);
            }
        }
    }
    async restoreStock(orderId) {
        return this.restockOrderItems(orderId);
    }
    async getOrderStats() {
        const total = await this.orderRepository.count();
        const pending = await this.orderRepository.count({ where: { status: order_entity_1.OrderStatus.PENDING } });
        const processing = await this.orderRepository.count({ where: { status: order_entity_1.OrderStatus.PROCESSING } });
        const shipped = await this.orderRepository.count({ where: { status: order_entity_1.OrderStatus.SHIPPED } });
        const delivered = await this.orderRepository.count({ where: { status: order_entity_1.OrderStatus.DELIVERED } });
        const cancelled = await this.orderRepository.count({ where: { status: order_entity_1.OrderStatus.CANCELLED } });
        const revenueResult = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.total)', 'revenue')
            .where('order.status IN (:...statuses)', { statuses: [order_entity_1.OrderStatus.DELIVERED, order_entity_1.OrderStatus.SHIPPED] })
            .getRawOne();
        return {
            total,
            pending,
            processing,
            shipped,
            delivered,
            cancelled,
            revenue: Number(revenueResult?.revenue || 0),
        };
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(order_item_entity_1.OrderItem)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(cart_entity_1.Cart)),
    __param(4, (0, typeorm_1.InjectRepository)(coupon_entity_1.Coupon)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], OrdersService);
//# sourceMappingURL=orders.service.js.map