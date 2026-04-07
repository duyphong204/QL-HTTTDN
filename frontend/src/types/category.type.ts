import type { BaseEntity } from "./common.type";
import type { Product } from "./warehouse.type";

export interface Category extends BaseEntity {
    name: string;

    // Dùng để hiển thị số lượng sản phẩm thuộc danh mục này (nếu backend trả về _count)
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