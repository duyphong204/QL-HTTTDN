import type { BaseEntity } from "./common.types";
import type { Product } from "./product.types";
import type { Supplier } from "./supplier.types";

export interface StockInDetailInput {
  productId: string;
  quantity: number;
  price: number;
}

export interface StockInDetailForm extends StockInDetailInput {
  _uid: string;
}

export interface StockInDetail extends BaseEntity {
  stockInId: string;
  productId: string;
  product?: Product;
  quantity: number;
  price: number;
}

export interface CreateStockInDto {
  supplierId: string;
  date?: Date;
  details: StockInDetailInput[];
}

export interface UpdateStockInDto {
  supplierId?: string;
  date?: Date;
  details?: StockInDetailInput[];
  status?: string;
}

export const StockInStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type StockInStatus = (typeof StockInStatus)[keyof typeof StockInStatus];

export interface StockIn extends BaseEntity {
  date: string | Date;
  totalAmount: number;
  supplierId: string;
  createdById?: string;
  approvedById?: string;
  creatorName?: string;
  approverName?: string;
  status: StockInStatus;
  supplier?: Supplier;
  details?: StockInDetail[];
}
