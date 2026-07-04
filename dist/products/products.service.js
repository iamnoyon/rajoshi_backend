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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("../entities/product.entity");
const product_image_entity_1 = require("../entities/product-image.entity");
const product_query_dto_1 = require("./dto/product-query.dto");
let ProductsService = class ProductsService {
    productRepository;
    productImageRepository;
    constructor(productRepository, productImageRepository) {
        this.productRepository = productRepository;
        this.productImageRepository = productImageRepository;
    }
    async findAll(query) {
        const { search, categoryId, minPrice, maxPrice, isFeatured, sort, tag, page = 1, limit = 10 } = query;
        const skip = (page - 1) * limit;
        if (tag === product_query_dto_1.ProductTag.BEST_SELLER) {
            const sumExpr = 'COALESCE(SUM(orderItems.quantity), 0)';
            const idsResult = await this.productRepository
                .createQueryBuilder('product')
                .leftJoin('product.orderItems', 'orderItems')
                .addSelect(sumExpr, 'totalSold')
                .where('product.isActive = :isActive', { isActive: true })
                .groupBy('product.id')
                .having('SUM(orderItems.quantity) > 0')
                .orderBy(sumExpr, 'DESC')
                .skip(skip)
                .take(limit)
                .getRawMany();
            const total = await this.productRepository
                .createQueryBuilder('product')
                .leftJoin('product.orderItems', 'orderItems')
                .where('product.isActive = :isActive', { isActive: true })
                .groupBy('product.id')
                .having('SUM(orderItems.quantity) > 0')
                .getCount();
            const ids = idsResult.map((r) => r.product_id);
            if (ids.length === 0) {
                return { content: [], total: 0, page, limit, totalPages: 0 };
            }
            const products = await this.productRepository
                .createQueryBuilder('product')
                .leftJoinAndSelect('product.productImages', 'productImages')
                .leftJoin('product.category', 'category')
                .addSelect(['category.id', 'category.name', 'category.slug'])
                .where('product.id IN (:...ids)', { ids })
                .getMany();
            const ordered = ids.map((id) => products.find((p) => p.id === id));
            return {
                content: ordered,
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            };
        }
        const qb = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.productImages', 'productImages')
            .leftJoin('product.category', 'category')
            .addSelect(['category.id', 'category.name', 'category.slug']);
        qb.where('product.isActive = :isActive', { isActive: true });
        if (search) {
            qb.andWhere('product.name ILIKE :search', { search: `%${search}%` });
        }
        if (categoryId) {
            qb.andWhere('product.categoryId = :categoryId', { categoryId });
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            qb.andWhere('product.price BETWEEN :minPrice AND :maxPrice', {
                minPrice: minPrice || 0,
                maxPrice: maxPrice || 9999999,
            });
        }
        if (tag) {
            qb.andWhere('product.tags ILIKE :tag', { tag: `%${tag}%` });
        }
        if (!sort) {
            qb.orderBy('product.createdAt', 'DESC');
        }
        if (sort) {
            const [field, dir] = sort.split(':');
            if (field && dir) {
                qb.orderBy(`product.${field}`, dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC');
            }
        }
        qb.skip(skip).take(limit);
        const [products, total] = await qb.getManyAndCount();
        return {
            content: products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['productImages', 'category', 'reviews', 'reviews.user'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async findBySlug(slug) {
        const product = await this.productRepository.findOne({
            where: { slug },
            relations: ['productImages', 'category', 'reviews', 'reviews.user'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        return product;
    }
    async create(dto) {
        const existingSlug = await this.productRepository.findOne({ where: { slug: dto.slug } });
        if (existingSlug) {
            throw new common_1.ConflictException('Product slug already exists');
        }
        const existingSku = await this.productRepository.findOne({ where: { sku: dto.sku } });
        if (existingSku) {
            throw new common_1.ConflictException('Product SKU already exists');
        }
        const product = this.productRepository.create(dto);
        return this.productRepository.save(product);
    }
    async update(id, dto) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        if (dto.slug && dto.slug !== product.slug) {
            const existing = await this.productRepository.findOne({ where: { slug: dto.slug } });
            if (existing) {
                throw new common_1.ConflictException('Product slug already exists');
            }
        }
        if (dto.sku && dto.sku !== product.sku) {
            const existing = await this.productRepository.findOne({ where: { sku: dto.sku } });
            if (existing) {
                throw new common_1.ConflictException('Product SKU already exists');
            }
        }
        Object.assign(product, dto);
        return this.productRepository.save(product);
    }
    async remove(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.productRepository.remove(product);
        return { message: 'Product deleted successfully' };
    }
    async toggleActive(id) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        product.isActive = !product.isActive;
        return this.productRepository.save(product);
    }
    async uploadImages(productId, files) {
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        const images = files.map((file) => {
            const image = new product_image_entity_1.ProductImage();
            image.url = file.path;
            image.publicId = file.filename;
            image.productId = productId;
            return image;
        });
        return this.productImageRepository.save(images);
    }
    async deleteImage(imageId) {
        const image = await this.productImageRepository.findOne({ where: { id: imageId } });
        if (!image) {
            throw new common_1.NotFoundException('Image not found');
        }
        await this.productImageRepository.remove(image);
        return { message: 'Image deleted successfully' };
    }
    async setPrimaryImage(productId, imageId) {
        await this.productImageRepository.update({ productId, isPrimary: true }, { isPrimary: false });
        await this.productImageRepository.update(imageId, { isPrimary: true });
        return { message: 'Primary image updated' };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __param(1, (0, typeorm_1.InjectRepository)(product_image_entity_1.ProductImage)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ProductsService);
//# sourceMappingURL=products.service.js.map