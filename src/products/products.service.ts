import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, FindOptionsWhere } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto, ProductTag } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { search, categoryId, minPrice, maxPrice, isFeatured, sort, tag, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    if (tag === ProductTag.BEST_SELLER) {
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

    if (tag === ProductTag.FEATURED) {
      qb.andWhere('product.isFeatured = :isFeatured', { isFeatured: true });
    } else if (tag) {
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

  async findByCategory(categoryId?: string, categoryName?: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const qb = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productImages', 'productImages')
      .leftJoin('product.category', 'category')
      .addSelect(['category.id', 'category.name', 'category.slug'])
      .where('product.isActive = :isActive', { isActive: true });

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    } else if (categoryName) {
      qb.andWhere('category.name ILIKE :categoryName', { categoryName: `%${categoryName}%` });
    }

    qb.orderBy('product.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [products, total] = await qb.getManyAndCount();

    return {
      content: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByIds(ids: string[]) {
    if (!ids || ids.length === 0) {
      return [];
    }

    return this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.productImages', 'productImages')
      .leftJoin('product.category', 'category')
      .addSelect(['category.id', 'category.name', 'category.slug'])
      .where('product.id IN (:...ids)', { ids })
      .andWhere('product.isActive = :isActive', { isActive: true })
      .getMany();
  }

  async findOne(id: string) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['productImages', 'category', 'reviews', 'reviews.user'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async findBySlug(slug: string) {
    const product = await this.productRepository.findOne({
      where: { slug },
      relations: ['productImages', 'category', 'reviews', 'reviews.user'],
    });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async create(dto: CreateProductDto) {
    const existingSlug = await this.productRepository.findOne({ where: { slug: dto.slug } });
    if (existingSlug) {
      throw new ConflictException('Product slug already exists');
    }

    const existingSku = await this.productRepository.findOne({ where: { sku: dto.sku } });
    if (existingSku) {
      throw new ConflictException('Product SKU already exists');
    }

    const product = this.productRepository.create(dto);
    return this.productRepository.save(product);
  }

  async update(id: string, dto: UpdateProductDto) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.productRepository.findOne({ where: { slug: dto.slug } });
      if (existing) {
        throw new ConflictException('Product slug already exists');
      }
    }

    if (dto.sku && dto.sku !== product.sku) {
      const existing = await this.productRepository.findOne({ where: { sku: dto.sku } });
      if (existing) {
        throw new ConflictException('Product SKU already exists');
      }
    }

    Object.assign(product, dto);
    return this.productRepository.save(product);
  }

  async remove(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    await this.productRepository.remove(product);
    return { message: 'Product deleted successfully' };
  }

  async toggleActive(id: string) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    product.isActive = !product.isActive;
    return this.productRepository.save(product);
  }

  async uploadImages(productId: string, files: Express.Multer.File[]) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const images = files.map((file) => {
      const image = new ProductImage();
      image.url = file.path;
      image.publicId = file.filename;
      image.productId = productId;
      return image;
    });

    return this.productImageRepository.save(images);
  }

  async deleteImage(imageId: string) {
    const image = await this.productImageRepository.findOne({ where: { id: imageId } });
    if (!image) {
      throw new NotFoundException('Image not found');
    }
    await this.productImageRepository.remove(image);
    return { message: 'Image deleted successfully' };
  }

  async setPrimaryImage(productId: string, imageId: string) {
    await this.productImageRepository.update(
      { productId, isPrimary: true },
      { isPrimary: false },
    );
    await this.productImageRepository.update(imageId, { isPrimary: true });
    return { message: 'Primary image updated' };
  }
}
