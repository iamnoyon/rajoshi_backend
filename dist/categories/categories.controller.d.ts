import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
    getDropdown(): Promise<import("../entities/category.entity").Category[]>;
    findAll(): Promise<import("../entities/category.entity").Category[]>;
    getNested(): Promise<import("../entities/category.entity").Category[]>;
    findOne(id: string): Promise<import("../entities/category.entity").Category>;
    findBySlug(slug: string): Promise<import("../entities/category.entity").Category>;
    create(dto: CreateCategoryDto): Promise<import("../entities/category.entity").Category>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("../entities/category.entity").Category>;
    remove(id: string): Promise<{
        message: string;
    }>;
    uploadBanner(id: string, image: string): Promise<import("../entities/category.entity").Category>;
}
