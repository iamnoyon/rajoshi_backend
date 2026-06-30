import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from '../entities/cart.entity';
import { Product } from '../entities/product.entity';
import { Coupon } from '../entities/coupon.entity';
import { CouponType } from '../entities/coupon.entity';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartDto } from './dto/update-cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  async getCart(userId: string) {
    const items = await this.cartRepository.find({
      where: { userId },
      relations: ['product', 'product.productImages', 'product.category'],
      order: { createdAt: 'DESC' },
    });

    const subtotal = items.reduce((sum, item) => {
      const price = item.product.discountPrice || item.product.price;
      return sum + Number(price) * item.quantity;
    }, 0);

    return { items, subtotal, totalItems: items.reduce((sum, item) => sum + item.quantity, 0) };
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const product = await this.productRepository.findOne({ where: { id: dto.productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    if (!product.isActive) {
      throw new BadRequestException('Product is not available');
    }
    if (product.stock < dto.quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    let cartItem = await this.cartRepository.findOne({
      where: { userId, productId: dto.productId },
    });

    if (cartItem) {
      cartItem.quantity += dto.quantity;
      if (cartItem.quantity > product.stock) {
        throw new BadRequestException('Insufficient stock');
      }
    } else {
      cartItem = this.cartRepository.create({
        userId,
        productId: dto.productId,
        quantity: dto.quantity,
      });
    }

    await this.cartRepository.save(cartItem);
    return this.getCart(userId);
  }

  async updateCartItem(userId: string, productId: string, dto: UpdateCartDto) {
    const cartItem = await this.cartRepository.findOne({
      where: { userId, productId },
      relations: ['product'],
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    if (dto.quantity > cartItem.product.stock) {
      throw new BadRequestException('Insufficient stock');
    }

    cartItem.quantity = dto.quantity;
    await this.cartRepository.save(cartItem);
    return this.getCart(userId);
  }

  async removeFromCart(userId: string, productId: string) {
    const cartItem = await this.cartRepository.findOne({
      where: { userId, productId },
    });
    if (!cartItem) {
      throw new NotFoundException('Cart item not found');
    }
    await this.cartRepository.remove(cartItem);
    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    await this.cartRepository.delete({ userId });
    return { message: 'Cart cleared' };
  }

  async applyCoupon(userId: string, code: string) {
    const coupon = await this.couponRepository.findOne({ where: { code, isActive: true } });
    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    const cart = await this.getCart(userId);
    if (coupon.minOrder && cart.subtotal < coupon.minOrder) {
      throw new BadRequestException(`Minimum order amount of ${coupon.minOrder} required`);
    }

    let discount = 0;
    if (coupon.type === CouponType.PERCENTAGE) {
      discount = (cart.subtotal * Number(coupon.value)) / 100;
    } else {
      discount = Number(coupon.value);
    }

    discount = Math.min(discount, cart.subtotal);

    return {
      coupon: coupon.code,
      discount,
      subtotal: cart.subtotal,
      total: cart.subtotal - discount,
    };
  }
}
