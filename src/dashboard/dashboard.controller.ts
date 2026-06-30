import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities/user.entity';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@Roles(UserRole.ADMIN)
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard stats (Admin)' })
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('monthly-sales/:year')
  @ApiOperation({ summary: 'Get monthly sales (Admin)' })
  getMonthlySales(@Param('year') year: string) {
    return this.dashboardService.getMonthlySales(year ? parseInt(year) : undefined);
  }

  @Get('best-selling')
  @ApiOperation({ summary: 'Get best selling products (Admin)' })
  getBestSelling() {
    return this.dashboardService.getBestSellingProducts();
  }

  @Get('recent-orders')
  @ApiOperation({ summary: 'Get recent orders (Admin)' })
  getRecentOrders() {
    return this.dashboardService.getRecentOrders();
  }

  @Get('top-customers')
  @ApiOperation({ summary: 'Get top customers (Admin)' })
  getTopCustomers() {
    return this.dashboardService.getTopCustomers();
  }

  @Get('revenue-overview')
  @ApiOperation({ summary: 'Get revenue overview (Admin)' })
  getRevenueOverview() {
    return this.dashboardService.getRevenueOverview();
  }
}
