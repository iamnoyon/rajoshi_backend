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
import { ProductQueryDto } from './dto/product-query.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
  ) {}

  async findAll(query: ProductQueryDto) {
    const { search, categoryId, minPrice, maxPrice, isFeatured, sort, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: FindOptionsWhere<Product> = {};
    where.isActive = true;

    if (search) {
      where.name = Like(`%${search}%`);
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = Between(minPrice || 0, maxPrice || 9999999);
    }
    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    let order: any = { createdAt: 'DESC' };
    if (sort) {
      const [field, dir] = sort.split(':');
      if (field && dir) {
        order = { [field]: dir.toUpperCase() === 'ASC' ? 'ASC' : 'DESC' };
      }
    }

    const [products, total] = await this.productRepository.findAndCount({
      where,
      relations: ['productImages', 'category', 'reviews'],
      order,
      skip,
      take: limit,
    });

    return {
      content: products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findFeatured() {
    return this.productRepository.find({
      where: { isFeatured: true, isActive: true },
      relations: ['productImages', 'category'],
      take: 8,
    });
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
