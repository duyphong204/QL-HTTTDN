import type { BaseEntity } from "./common.type";
import type { Product } from "./warehouse.type";

export type PromotionType = "PERCENT" | "FIXED";

export interface PromotionProductLink extends BaseEntity {
  productId: string;
  product: Pick<Product, "id" | "name" | "price" | "stockQuantity">;
}

export interface Promotion extends BaseEntity {
  name: string;
  type: PromotionType;
  value: number;
  startAt?: string;
  endAt?: string;
  isActive: boolean;
  products: PromotionProductLink[];
}

export interface CreatePromotionDto {
  name: string;
  type: PromotionType;
  value: number;
  startAt?: string;
  endAt?: string;
  isActive?: boolean;
  productIds?: string[];
}

export interface UpdatePromotionDto {
  name?: string;
  type?: PromotionType;
  value?: number;
  startAt?: string;
  endAt?: string;
  isActive?: boolean;
}
