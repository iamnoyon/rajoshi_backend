import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';
import { Coupon } from '../entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart, Product, Coupon])],
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService],
})
export class CartModule {}
