import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '../entities/order.entity';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    create(userId: string, dto: CreateOrderDto): Promise<import("../entities/order.entity").Order>;
    findMyOrders(userId: string, query: PaginationDto): Promise<{
        data: import("../entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAll(query: PaginationDto, status?: OrderStatus): Promise<{
        data: import("../entities/order.entity").Order[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getStats(): Promise<{
        total: number;
        pending: number;
        processing: number;
        shipped: number;
        delivered: number;
        cancelled: number;
        revenue: number;
    }>;
    findOne(id: string): Promise<import("../entities/order.entity").Order>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<import("../entities/order.entity").Order>;
    cancel(userId: string, id: string): Promise<import("../entities/order.entity").Order>;
}
