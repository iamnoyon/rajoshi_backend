import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon, CouponType } from '../entities/coupon.entity';
import { Product } from '../entities/product.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { PreviewOrderDto } from './dto/preview-order.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [coupons, total] = await this.couponRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      content: coupons,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async findByCode(code: string) {
    const coupon = await this.couponRepository.findOne({ where: { code, isActive: true } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    return {
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
      expiresAt: coupon.expiresAt,
      description: coupon.type === 'percentage'
        ? `${coupon.value}% off`
        : `Flat ${coupon.value} off`,
    };
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.couponRepository.findOne({
      where: { code: dto.code },
    });
    if (existing) {
      throw new ConflictException('Coupon code already exists');
    }

    const coupon = this.couponRepository.create(dto);
    return this.couponRepository.save(coupon);
  }

  async update(id: string, dto: UpdateCouponDto) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }

    if (dto.code && dto.code !== coupon.code) {
      const existing = await this.couponRepository.findOne({
        where: { code: dto.code },
      });
      if (existing) {
        throw new ConflictException('Coupon code already exists');
      }
    }

    Object.assign(coupon, dto);
    return this.couponRepository.save(coupon);
  }

  async remove(id: string) {
    const coupon = await this.couponRepository.findOne({ where: { id } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    await this.couponRepository.remove(coupon);
    return { message: 'Coupon deleted successfully' };
  }

  async validateCoupon(code: string, orderTotal: number) {
    const coupon = await this.couponRepository.findOne({
      where: { code, isActive: true },
    });
    if (!coupon) {
      throw new NotFoundException('Invalid coupon code');
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new BadRequestException('Coupon has expired');
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      throw new BadRequestException('Coupon usage limit reached');
    }

    if (coupon.minOrder && orderTotal < coupon.minOrder) {
      throw new BadRequestException(
        `Minimum order amount of ${coupon.minOrder} required`,
      );
    }

    return { valid: true, coupon };
  }

  async findAvailableCoupons() {
    const coupons = await this.couponRepository
      .createQueryBuilder('coupon')
      .where('coupon.isActive = :isActive', { isActive: true })
      .andWhere('(coupon.expiresAt IS NULL OR coupon.expiresAt > :now)', { now: new Date() })
      .andWhere('(coupon.maxUses IS NULL OR coupon.usedCount < coupon.maxUses)')
      .orderBy('coupon.createdAt', 'DESC')
      .getMany();

    return coupons.map((coupon) => ({
      code: coupon.code,
      type: coupon.type,
      value: Number(coupon.value),
      minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
      expiresAt: coupon.expiresAt,
      description: coupon.type === 'percentage'
        ? `${coupon.value}% off`
        : `Flat ${coupon.value} off`,
      remainingUses: coupon.maxUses !== null ? coupon.maxUses - coupon.usedCount : null,
    }));
  }

  async previewOrder(dto: PreviewOrderDto) {
    const previewItems = [];
    let subtotal = 0;

    for (const item of dto.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new NotFoundException(`Product ${item.productId} not found`);
      }
      if (!product.isActive) {
        throw new BadRequestException(
          `Product ${product.name} is not available`,
        );
      }
      if (product.stock < item.quantity) {
        throw new BadRequestException(`Insufficient stock for ${product.name}`);
      }

      const unitPrice = Number(product.discountPrice || product.price);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      previewItems.push({
        productId: product.id,
        name: product.name,
        slug: product.slug,
        quantity: item.quantity,
        unitPrice,
        lineTotal,
      });
    }

    let discount = 0;
    let couponCode: string | null = null;

    if (dto.couponCode) {
      const coupon = await this.couponRepository.findOne({
        where: { code: dto.couponCode, isActive: true },
      });
      if (!coupon) {
        throw new BadRequestException('Invalid coupon code');
      }
      if (coupon.expiresAt && coupon.expiresAt < new Date()) {
        throw new BadRequestException('Coupon has expired');
      }
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
        throw new BadRequestException('Coupon usage limit reached');
      }
      if (coupon.minOrder && subtotal < coupon.minOrder) {
        throw new BadRequestException(
          `Minimum order of ${coupon.minOrder} required`,
        );
      }

      discount =
        coupon.type === CouponType.PERCENTAGE
          ? (subtotal * Number(coupon.value)) / 100
          : Number(coupon.value);
      discount = Math.min(discount, subtotal);
      couponCode = coupon.code;
    }

    return {
      items: previewItems,
      subtotal,
      coupon: couponCode,
      discount,
      total: subtotal - discount,
    };
  }
}
