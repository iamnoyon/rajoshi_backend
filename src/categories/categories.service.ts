import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

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

  async findOne(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children', 'parent', 'products'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async findBySlug(slug: string) {
    const category = await this.categoryRepository.findOne({
      where: { slug },
      relations: ['children', 'parent', 'products'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    return category;
  }

  async getNestedCategories() {
    const categories = await this.categoryRepository.find({
      where: { parentId: '' as any },
      relations: ['children', 'children.children'],
      order: { name: 'ASC' },
    });
    return categories;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
    if (existing) {
      throw new ConflictException('Category slug already exists');
    }

    const category = this.categoryRepository.create(dto);
    return this.categoryRepository.save(category);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (dto.slug && dto.slug !== category.slug) {
      const existing = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException('Category slug already exists');
      }
    }

    if (dto.parentId === id) {
      throw new ConflictException('Category cannot be its own parent');
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) {
      throw new NotFoundException('Category not found');
    }

    if (category.children && category.children.length > 0) {
      throw new ConflictException('Cannot delete category with subcategories');
    }

    await this.categoryRepository.remove(category);
    return { message: 'Category deleted successfully' };
  }

  async uploadBanner(id: string, imageUrl: string) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Category not found');
    }
    category.image = imageUrl;
    return this.categoryRepository.save(category);
  }
}
