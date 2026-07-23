import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { Cart } from '../entities/cart.entity';
import { Coupon } from '../entities/coupon.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, Cart, Coupon]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
