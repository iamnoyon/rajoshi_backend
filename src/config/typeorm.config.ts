import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { Category } from '../entities/category.entity';
import { ProductImage } from '../entities/product-image.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Payment } from '../entities/payment.entity';
import { Coupon } from '../entities/coupon.entity';
import { Review } from '../entities/review.entity';
import { Wishlist } from '../entities/wishlist.entity';
import { Cart } from '../entities/cart.entity';
import { Address } from '../entities/address.entity';
import { Message } from 'src/entities/message.entity';

export const typeOrmConfig = (
  configService: ConfigService,
): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: configService.get<string>('database.host'),
  port: configService.get<number>('database.port'),
  username: configService.get<string>('database.username'),
  password: configService.get<string>('database.password'),
  database: configService.get<string>('database.database'),
  entities: [
    User,
    Product,
    Category,
    ProductImage,
    Order,
    OrderItem,
    Payment,
    Coupon,
    Review,
    Wishlist,
    Cart,
    Address,
    Message,
  ],
  synchronize: true,
});
