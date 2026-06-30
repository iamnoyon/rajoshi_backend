import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { Cart } from '../entities/cart.entity';
import { Coupon } from '../entities/coupon.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
export declare class OrdersService {
    private orderRepository;
    private orderItemRepository;
    private productRepository;
    private cartRepository;
    private couponRepository;
    constructor(orderRepository: Repository<Order>, orderItemRepository: Repository<OrderItem>, productRepository: Repository<Product>, cartRepository: Repository<Cart>, couponRepository: Repository<Coupon>);
    private generateOrderNumber;
    create(userId: string, dto: CreateOrderDto): Promise<Order>;
    findMyOrders(userId: string, page?: number, limit?: number): Promise<{
        content: Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAll(page?: number, limit?: number, status?: OrderStatus): Promise<{
        content: Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Order>;
    findByOrderNumber(orderNumber: string): Promise<Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<Order>;
    cancelOrder(userId: string, id: string): Promise<Order>;
    private restockOrderItems;
    private restoreStock;
    getOrderStats(): Promise<{
        total: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        revenue: number;
    }>;
}
