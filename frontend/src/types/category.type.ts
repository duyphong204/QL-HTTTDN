import type { BaseEntity } from "./common.type";
import type { Product } from "./warehouse.type";

export interface Category extends BaseEntity {
    name: string;
    _count?: {
        products: number;
    };
    products?: Product[];
}

export interface CreateCategoryDto {
    name: string;
}

export interface UpdateCategoryDto {
    name: string;
}
export interface CategoryResponse {
    data: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
