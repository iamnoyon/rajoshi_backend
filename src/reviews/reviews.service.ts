import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async findByProduct(productId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: { productId, isApproved: true },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      content: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await this.reviewRepository.findAndCount({
      relations: ['user', 'product'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      content: reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(userId: string, dto: CreateReviewDto) {
    const product = await this.productRepository.findOne({
      where: { id: dto.productId },
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const existing = await this.reviewRepository.findOne({
      where: { userId, productId: dto.productId },
    });
    if (existing) {
      throw new ForbiddenException('You have already reviewed this product');
    }

    const review = this.reviewRepository.create({
      userId,
      productId: dto.productId,
      rating: dto.rating,
      comment: dto.comment,
    });

    return this.reviewRepository.save(review);
  }

  async update(userId: string, reviewId: string, dto: UpdateReviewDto) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only edit your own reviews');
    }

    if (dto.rating) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;

    return this.reviewRepository.save(review);
  }

  async delete(userId: string, reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviewRepository.remove(review);
    return { message: 'Review deleted successfully' };
  }

  async approve(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.isApproved = true;
    return this.reviewRepository.save(review);
  }

  async hide(reviewId: string) {
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId },
    });
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    review.isApproved = false;
    return this.reviewRepository.save(review);
  }
}
