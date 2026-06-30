import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductQueryDto } from './dto/product-query.dto';
export declare class ProductsController {
    private productsService;
    constructor(productsService: ProductsService);
    findAll(query: ProductQueryDto): Promise<{
        content: import("../entities/product.entity").Product[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findFeatured(): Promise<import("../entities/product.entity").Product[]>;
    findOne(id: string): Promise<import("../entities/product.entity").Product>;
    findBySlug(slug: string): Promise<import("../entities/product.entity").Product>;
    create(dto: CreateProductDto): Promise<import("../entities/product.entity").Product>;
    update(id: string, dto: UpdateProductDto): Promise<import("../entities/product.entity").Product>;
    remove(id: string): Promise<{
        message: string;
    }>;
    toggleActive(id: string): Promise<import("../entities/product.entity").Product>;
    uploadImages(id: string, files: Express.Multer.File[]): Promise<import("../entities/product-image.entity").ProductImage[]>;
    deleteImage(imageId: string): Promise<{
        message: string;
    }>;
    setPrimaryImage(id: string, imageId: string): Promise<{
        message: string;
    }>;
}
