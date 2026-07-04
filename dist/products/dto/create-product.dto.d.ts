export declare class CreateProductDto {
    name: string;
    slug: string;
    description?: string;
    price: number;
    discountPrice?: number;
    stock?: number;
    sku: string;
    shortnote?: string;
    features?: string[];
    images?: string[];
    tags?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    categoryId: string;
}
