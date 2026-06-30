import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getStats(): Promise<{
        revenue: number;
        totalOrders: number;
        totalCustomers: number;
        totalProducts: number;
        pendingOrders: number;
        lowStockProducts: number;
    }>;
    getMonthlySales(year: string): Promise<{
        month: number;
        revenue: number;
        count: number;
    }[]>;
    getBestSelling(): Promise<any[]>;
    getRecentOrders(): Promise<import("../entities/order.entity").Order[]>;
    getTopCustomers(): Promise<any[]>;
    getRevenueOverview(): Promise<{
        today: number;
        thisWeek: number;
        thisMonth: number;
    }>;
}
