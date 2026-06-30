import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus, PaymentStatus } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';
import { Cart } from '../entities/cart.entity';
import { Coupon, CouponType } from '../entities/coupon.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `ORD-${timestamp}-${random}`;
  }

  async create(userId: string, dto: CreateOrderDto) {
    const orderItems: OrderItem[] = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (!product.isActive) {
        throw new BadRequestException(`Product ${product.name} is not available`);
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const price = product.discountPrice || product.price;
      subtotal += Number(price) * item.quantity;

      const orderItem = this.orderItemRepository.create({
        quantity: item.quantity,
        price: Number(price),
        productId: item.productId,
      });
      orderItems.push(orderItem);

      product.stock -= item.quantity;
      await this.productRepository.save(product);
    }

    let discount = 0;
    if (dto.couponCode) {
      const coupon = await this.couponRepository.findOne({
        where: { code: dto.couponCode, isActive: true },
      });
      if (coupon) {
        if (coupon.expiresAt && coupon.expiresAt < new Date()) {
          throw new BadRequestException('Coupon has expired');
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw new BadRequestException('Coupon usage limit reached');
        }
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          throw new BadRequestException(`Minimum order of ${coupon.minOrder} required`);
        }

        discount = coupon.type === CouponType.PERCENTAGE
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
        discount = Math.min(discount, subtotal);

        coupon.usedCount += 1;
        await this.couponRepository.save(coupon);
      }
    }

    const shipping = dto.deliveryMethod ? 100 : 0;
    const total = subtotal - discount + shipping;

    const order = this.orderRepository.create({
      orderNumber: this.generateOrderNumber(),
      subtotal,
      shipping,
      discount,
      total,
      userId,
      shippingAddress: dto.shippingAddress,
      billingAddress: dto.billingAddress || dto.shippingAddress,
      deliveryMethod: dto.deliveryMethod,
      paymentMethod: dto.paymentMethod,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    await this.cartRepository.delete({ userId });

    return this.findOne(savedOrder.id);
  }

  async findMyOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [orders, total] = await this.orderRepository.findAndCount({
      where: { userId },
      relations: ['items', 'items.product', 'payment'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      content: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(page: number = 1, limit: number = 10, status?: OrderStatus) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [orders, total] = await this.orderRepository.findAndCount({
      where,
      relations: ['items', 'items.product', 'user', 'payment'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      content: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'items.product.productImages', 'user', 'payment'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'items.product', 'user', 'payment'],
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    order.status = dto.status;
    if (dto.status === OrderStatus.CANCELLED) {
      await this.restoreStock(order.id);
    }

    return this.orderRepository.save(order);
  }

  async cancelOrder(userId: string, id: string) {
    const order = await this.orderRepository.findOne({ where: { id, userId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
      throw new BadRequestException('Order cannot be cancelled at this stage');
    }

    order.status = OrderStatus.CANCELLED;
    await this.restockOrderItems(order.id);
    return this.orderRepository.save(order);
  }

  private async restockOrderItems(orderId: string) {
    const items = await this.orderItemRepository.find({ where: { orderId } });
    for (const item of items) {
      const product = await this.productRepository.findOne({ where: { id: item.productId } });
      if (product) {
        product.stock += item.quantity;
        await this.productRepository.save(product);
      }
    }
  }

  private async restoreStock(orderId: string) {
    return this.restockOrderItems(orderId);
  }

  async getOrderStats() {
    const total = await this.orderRepository.count();
    const pending = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });
    const processing = await this.orderRepository.count({ where: { status: OrderStatus.PROCESSING } });
    const shipped = await this.orderRepository.count({ where: { status: OrderStatus.SHIPPED } });
    const delivered = await this.orderRepository.count({ where: { status: OrderStatus.DELIVERED } });
    const cancelled = await this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } });

    const revenueResult = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.total)', 'revenue')
      .where('order.status IN (:...statuses)', { statuses: [OrderStatus.DELIVERED, OrderStatus.SHIPPED] })
      .getRawOne();

    return {
      total,
      pending,
      processing,
      shipped,
      delivered,
      cancelled,
      revenue: Number(revenueResult?.revenue || 0),
    };
  }
}
