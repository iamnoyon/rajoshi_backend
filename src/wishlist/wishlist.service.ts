import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entities/wishlist.entity';
import { Product } from '../entities/product.entity';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findAll(userId: string) {
    return this.wishlistRepository.find({
      where: { userId },
      relations: ['product', 'product.productImages', 'product.category'],
      order: { createdAt: 'DESC' },
    });
  }

  async add(userId: string, productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    if (existing) {
      throw new ConflictException('Product already in wishlist');
    }

    const item = this.wishlistRepository.create({ userId, productId });
    return this.wishlistRepository.save(item);
  }

  async remove(userId: string, productId: string) {
    const item = await this.wishlistRepository.findOne({
      where: { userId, productId },
    });
    if (!item) {
      throw new NotFoundException('Wishlist item not found');
    }
    await this.wishlistRepository.remove(item);
    return { message: 'Removed from wishlist' };
  }
}
