"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const review_entity_1 = require("../entities/review.entity");
const product_entity_1 = require("../entities/product.entity");
let ReviewsService = class ReviewsService {
    reviewRepository;
    productRepository;
    constructor(reviewRepository, productRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
    }
    async findByProduct(productId, page = 1, limit = 10) {
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
    async findAll(page = 1, limit = 10) {
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
    async create(userId, dto) {
        const product = await this.productRepository.findOne({ where: { id: dto.productId } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const existing = await this.reviewRepository.findOne({
            where: { userId, productId: dto.productId },
        });
        if (existing) {
            throw new common_1.ForbiddenException('You have already reviewed this product');
        }
        const review = this.reviewRepository.create({
            userId,
            productId: dto.productId,
            rating: dto.rating,
            comment: dto.comment,
        });
        return this.reviewRepository.save(review);
    }
    async update(userId, reviewId, dto) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only edit your own reviews');
        }
        if (dto.rating)
            review.rating = dto.rating;
        if (dto.comment !== undefined)
            review.comment = dto.comment;
        return this.reviewRepository.save(review);
    }
    async delete(userId, reviewId) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        if (review.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own reviews');
        }
        await this.reviewRepository.remove(review);
        return { message: 'Review deleted successfully' };
    }
    async approve(reviewId) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        review.isApproved = true;
        return this.reviewRepository.save(review);
    }
    async hide(reviewId) {
        const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        review.isApproved = false;
        return this.reviewRepository.save(review);
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(review_entity_1.Review)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map