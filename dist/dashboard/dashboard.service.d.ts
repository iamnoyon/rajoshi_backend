import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';
export declare class DashboardService {
    private orderRepository;
    private userRepository;
    private productRepository;
    private reviewRepository;
    constructor(orderRepository: Repository<Order>, userRepository: Repository<User>, productRepository: Repository<Product>, reviewRepository: Repository<Review>);
    getStats(): Promise<{
        revenue: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        pendingOrders: number;
        lowStockProducts: number;
    }>;
    getMonthlySales(year?: number): Promise<{
        month: number;
        revenue: number;
        count: number;
    }[]>;
    getBestSellingProducts(limit?: number): Promise<any[]>;
    getRecentOrders(limit?: number): Promise<Order[]>;
    getTopCustomers(limit?: number): Promise<any[]>;
    getRevenueOverview(): Promise<{
        today: number;
        thisWeek: number;
        thisMonth: number;
    }>;
}
