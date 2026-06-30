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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const category_entity_1 = require("../entities/category.entity");
let CategoriesService = class CategoriesService {
    categoryRepository;
    constructor(categoryRepository) {
        this.categoryRepository = categoryRepository;
    }
    async findAll() {
        return this.categoryRepository.find({
            relations: ['children', 'parent'],
            order: { name: 'ASC' },
        });
    }
    async getDropdown() {
        return this.categoryRepository.find({
            select: ['id', 'name', 'slug'],
            order: { name: 'ASC' },
        });
    }
    async findOne(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['children', 'parent', 'products'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async findBySlug(slug) {
        const category = await this.categoryRepository.findOne({
            where: { slug },
            relations: ['children', 'parent', 'products'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        return category;
    }
    async getNestedCategories() {
        const categories = await this.categoryRepository.find({
            where: { parentId: '' },
            relations: ['children', 'children.children'],
            order: { name: 'ASC' },
        });
        return categories;
    }
    async create(dto) {
        const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
        if (existing) {
            throw new common_1.ConflictException('Category slug already exists');
        }
        const category = this.categoryRepository.create(dto);
        return this.categoryRepository.save(category);
    }
    async update(id, dto) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (dto.slug && dto.slug !== category.slug) {
            const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
            if (existing) {
                throw new common_1.ConflictException('Category slug already exists');
            }
        }
        if (dto.parentId === id) {
            throw new common_1.ConflictException('Category cannot be its own parent');
        }
        Object.assign(category, dto);
        return this.categoryRepository.save(category);
    }
    async remove(id) {
        const category = await this.categoryRepository.findOne({
            where: { id },
            relations: ['children'],
        });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        if (category.children && category.children.length > 0) {
            throw new common_1.ConflictException('Cannot delete category with subcategories');
        }
        await this.categoryRepository.remove(category);
        return { message: 'Category deleted successfully' };
    }
    async uploadBanner(id, imageUrl) {
        const category = await this.categoryRepository.findOne({ where: { id } });
        if (!category) {
            throw new common_1.NotFoundException('Category not found');
        }
        category.image = imageUrl;
        return this.categoryRepository.save(category);
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(category_entity_1.Category)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map