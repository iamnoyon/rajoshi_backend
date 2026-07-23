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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const user_entity_1 = require("../entities/user.entity");
const product_entity_1 = require("../entities/product.entity");
const review_entity_1 = require("../entities/review.entity");
let DashboardService = class DashboardService {
    orderRepository;
    userRepository;
    productRepository;
    reviewRepository;
    constructor(orderRepository, userRepository, productRepository, reviewRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.reviewRepository = reviewRepository;
    }
    async getStats() {
        const totalRevenue = await this.orderRepository
            .createQueryBuilder('order')
            .select('COALESCE(SUM(order.total), 0)', 'revenue')
            .where('order.status IN (:...statuses)', {
            statuses: [
                order_entity_1.OrderStatus.DELIVERED,
                order_entity_1.OrderStatus.SHIPPED,
                order_entity_1.OrderStatus.CONFIRMED,
            ],
        })
            .getRawOne();
        const totalOrders = await this.orderRepository.count();
        const totalCustomers = await this.userRepository.count({
            where: { role: user_entity_1.UserRole.CUSTOMER },
        });
        const totalProducts = await this.productRepository.count();
        const pendingOrders = await this.orderRepository.count({
            where: { status: order_entity_1.OrderStatus.PENDING },
        });
        const lowStockProducts = await this.productRepository.count({
            where: { stock: 10 },
        });
        return {
            revenue: Number(totalRevenue?.revenue || 0),
            totalOrders,
            totalCustomers,
            totalProducts,
            pendingOrders,
            lowStockProducts,
        };
    }
    async getMonthlySales(year) {
        const targetYear = year || new Date().getFullYear();
        const monthlySales = await this.orderRepository
            .createQueryBuilder('order')
            .select('EXTRACT(MONTH FROM order.createdAt)', 'month')
            .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
            .addSelect('COUNT(order.id)', 'count')
            .where('EXTRACT(YEAR FROM order.createdAt) = :year', { year: targetYear })
            .andWhere('order.status IN (:...statuses)', {
            statuses: [
                order_entity_1.OrderStatus.DELIVERED,
                order_entity_1.OrderStatus.SHIPPED,
                order_entity_1.OrderStatus.CONFIRMED,
            ],
        })
            .groupBy('month')
            .orderBy('month', 'ASC')
            .getRawMany();
        const months = Array.from({ length: 12 }, (_, i) => {
            const month = i + 1;
            const found = monthlySales.find((m) => Number(m.month) === month);
            return {
                month,
                revenue: Number(found?.revenue || 0),
                count: Number(found?.count || 0),
            };
        });
        return months;
    }
    async getBestSellingProducts(limit = 5) {
        const products = await this.orderRepository
            .createQueryBuilder('order')
            .select('order_item.productId', 'productId')
            .addSelect('product.name', 'name')
            .addSelect('product.price', 'price')
            .addSelect('SUM(order_item.quantity)', 'totalSold')
            .addSelect('SUM(order_item.price * order_item.quantity)', 'totalRevenue')
            .innerJoin('order.items', 'order_item')
            .innerJoin('order_item.product', 'product')
            .where('order.status IN (:...statuses)', {
            statuses: [
                order_entity_1.OrderStatus.DELIVERED,
                order_entity_1.OrderStatus.SHIPPED,
                order_entity_1.OrderStatus.CONFIRMED,
            ],
        })
            .groupBy('order_item.productId')
            .addGroupBy('product.name')
            .addGroupBy('product.price')
            .orderBy('totalSold', 'DESC')
            .limit(limit)
            .getRawMany();
        return products;
    }
    async getRecentOrders(limit = 5) {
        return this.orderRepository.find({
            relations: ['user', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getTopCustomers(limit = 5) {
        const customers = await this.orderRepository
            .createQueryBuilder('order')
            .select('order.userId', 'userId')
            .addSelect('user.name', 'name')
            .addSelect('user.email', 'email')
            .addSelect('COUNT(order.id)', 'orderCount')
            .addSelect('COALESCE(SUM(order.total), 0)', 'totalSpent')
            .innerJoin('order.user', 'user')
            .where('order.status IN (:...statuses)', {
            statuses: [
                order_entity_1.OrderStatus.DELIVERED,
                order_entity_1.OrderStatus.SHIPPED,
                order_entity_1.OrderStatus.CONFIRMED,
            ],
        })
            .groupBy('order.userId')
            .addGroupBy('user.name')
            .addGroupBy('user.email')
            .orderBy('totalSpent', 'DESC')
            .limit(limit)
            .getRawMany();
        return customers;
    }
    async getRevenueOverview() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = await this.orderRepository
            .createQueryBuilder('order')
            .select('COALESCE(SUM(order.total), 0)', 'revenue')
            .where('order.createdAt >= :today', { today })
            .andWhere('order.status IN (:...statuses)', {
            statuses: [
                order_entity_1.OrderStatus.DELIVERED,
                order_entity_1.OrderStatus.SHIPPED,
                order_entity_1.OrderStatus.CONFIRMED,
            ],
        })
            .getRawOne();
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weekRevenue = await this.orderRepository
            .createQueryBuilder('order')
            .select('COALESCE(SUM(order.total), 0)', 'revenue')
            .where('order.createdAt >= :weekAgo', { weekAgo })
            .andWhere('order.status IN (:...statuses)', {
            statuses: [
                order_entity_1.OrderStatus.DELIVERED,
                order_entity_1.OrderStatus.SHIPPED,
                order_entity_1.OrderStatus.CONFIRMED,
            ],
        })
            .getRawOne();
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const monthRevenue = await this.orderRepository
            .createQueryBuilder('order')
            .select('COALESCE(SUM(order.total), 0)', 'revenue')
            .where('order.createdAt >= :monthAgo', { monthAgo })
            .andWhere('order.status IN (:...statuses)', {
            statuses: [
                order_entity_1.OrderStatus.DELIVERED,
                order_entity_1.OrderStatus.SHIPPED,
                order_entity_1.OrderStatus.CONFIRMED,
            ],
        })
            .getRawOne();
        return {
            today: Number(todayRevenue?.revenue || 0),
            thisWeek: Number(weekRevenue?.revenue || 0),
            thisMonth: Number(monthRevenue?.revenue || 0),
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(3, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map