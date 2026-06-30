import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { Product } from '../entities/product.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsService {
    private reviewRepository;
    private productRepository;
    constructor(reviewRepository: Repository<Review>, productRepository: Repository<Product>);
    findByProduct(productId: string, page?: number, limit?: number): Promise<{
        content: Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAll(page?: number, limit?: number): Promise<{
        content: Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(userId: string, dto: CreateReviewDto): Promise<Review>;
    update(userId: string, reviewId: string, dto: UpdateReviewDto): Promise<Review>;
    delete(userId: string, reviewId: string): Promise<{
        message: string;
    }>;
    approve(reviewId: string): Promise<Review>;
    hide(reviewId: string): Promise<Review>;
}
