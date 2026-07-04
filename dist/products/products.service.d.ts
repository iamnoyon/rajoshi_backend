import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';
import { ProductImage } from '../entities/product-image.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsService {
    private productRepository;
    private productImageRepository;
    constructor(productRepository: Repository<Product>, productImageRepository: Repository<ProductImage>);
    findAll(query: ProductQueryDto): Promise<{
        content: (Product | undefined)[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByCategory(categoryId?: string, categoryName?: string, page?: number, limit?: number): Promise<{
        content: Product[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findByIds(ids: string[]): Promise<Product[]>;
    findOne(id: string): Promise<Product>;
    findBySlug(slug: string): Promise<Product>;
    create(dto: CreateProductDto): Promise<Product>;
    update(id: string, dto: UpdateProductDto): Promise<Product>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<Product>;
    uploadImages(productId: string, files: Express.Multer.File[]): Promise<ProductImage[]>;
    deleteImage(imageId: string): Promise<{
        message: string;
    }>;
    setPrimaryImage(productId: string, imageId: string): Promise<{
        message: string;
    }>;
}
