import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { User, UserRole } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  async getStats() {
    const totalRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED],
      })
      .getRawOne();

    const totalOrders = await this.orderRepository.count();
    const totalCustomers = await this.userRepository.count({
      where: { role: UserRole.CUSTOMER },
    });
    const totalProducts = await this.productRepository.count();
    const pendingOrders = await this.orderRepository.count({
      where: { status: OrderStatus.PENDING },
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

  async getMonthlySales(year?: number) {
    const targetYear = year || new Date().getFullYear();

    const monthlySales = await this.orderRepository
      .createQueryBuilder('order')
      .select("EXTRACT(MONTH FROM order.createdAt)", 'month')
      .addSelect('COALESCE(SUM(order.total), 0)', 'revenue')
      .addSelect('COUNT(order.id)', 'count')
      .where('EXTRACT(YEAR FROM order.createdAt) = :year', { year: targetYear })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED],
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

  async getBestSellingProducts(limit: number = 5) {
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
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED],
      })
      .groupBy('order_item.productId')
      .addGroupBy('product.name')
      .addGroupBy('product.price')
      .orderBy('totalSold', 'DESC')
      .limit(limit)
      .getRawMany();

    return products;
  }

  async getRecentOrders(limit: number = 5) {
    return this.orderRepository.find({
      relations: ['user', 'items', 'items.product'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getTopCustomers(limit: number = 5) {
    const customers = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.userId', 'userId')
      .addSelect('user.name', 'name')
      .addSelect('user.email', 'email')
      .addSelect('COUNT(order.id)', 'orderCount')
      .addSelect('COALESCE(SUM(order.total), 0)', 'totalSpent')
      .innerJoin('order.user', 'user')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED],
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
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED],
      })
      .getRawOne();

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const weekRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.createdAt >= :weekAgo', { weekAgo })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED],
      })
      .getRawOne();

    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const monthRevenue = await this.orderRepository
      .createQueryBuilder('order')
      .select('COALESCE(SUM(order.total), 0)', 'revenue')
      .where('order.createdAt >= :monthAgo', { monthAgo })
      .andWhere('order.status IN (:...statuses)', {
        statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED, OrderStatus.CONFIRMED],
      })
      .getRawOne();

    return {
      today: Number(todayRevenue?.revenue || 0),
      thisWeek: Number(weekRevenue?.revenue || 0),
      thisMonth: Number(monthRevenue?.revenue || 0),
    };
  }
}
