export declare enum ProductTag {
    BEST_SELLER = "Best_Seller",
    FEATURED = "Featured",
    NEW = "New",
    SALE = "Sale",
    TRENDING = "Trending"
}
export declare class ProductQueryDto {
    search?: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    isFeatured?: boolean;
    sort?: string;
    tag?: ProductTag;
    page?: number;
    limit?: number;
}
