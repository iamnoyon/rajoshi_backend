import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coupon } from '../entities/coupon.entity';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';

@Injectable()
export class CouponsService {
  constructor(
    @InjectRepository(Coupon)
    private couponRepository: Repository<Coupon>,
  ) {}

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [coupons, total] = await this.couponRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      data: coupons,
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
    const coupon = await this.couponRepository.findOne({ where: { code } });
    if (!coupon) {
      throw new NotFoundException('Coupon not found');
    }
    return coupon;
  }

  async create(dto: CreateCouponDto) {
    const existing = await this.couponRepository.findOne({ where: { code: dto.code } });
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
      const existing = await this.couponRepository.findOne({ where: { code: dto.code } });
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

    if (coupon.minOrder && orderTotal < coupon.minOrder) {
      throw new BadRequestException(`Minimum order amount of ${coupon.minOrder} required`);
    }

    return { valid: true, coupon };
  }
}
