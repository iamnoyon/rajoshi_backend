import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ReviewsController {
    private reviewsService;
    constructor(reviewsService: ReviewsService);
    findByProduct(productId: string, query: PaginationDto): Promise<{
        content: import("../entities/review.entity").Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findAll(query: PaginationDto): Promise<{
        content: import("../entities/review.entity").Review[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    create(userId: string, dto: CreateReviewDto): Promise<import("../entities/review.entity").Review>;
    update(userId: string, id: string, dto: UpdateReviewDto): Promise<import("../entities/review.entity").Review>;
    delete(userId: string, id: string): Promise<{
        message: string;
    }>;
    approve(id: string): Promise<import("../entities/review.entity").Review>;
    hide(id: string): Promise<import("../entities/review.entity").Review>;
}
