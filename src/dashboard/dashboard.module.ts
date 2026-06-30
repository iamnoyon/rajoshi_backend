import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Review } from '../entities/review.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, User, Product, Review])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
