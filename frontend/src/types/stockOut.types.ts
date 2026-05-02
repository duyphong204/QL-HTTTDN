import type { BaseEntity } from "./common.types";
import type { Product } from "./product.types";

export const StockOutStatus = {
  PENDING: "PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type StockOutStatus =
  (typeof StockOutStatus)[keyof typeof StockOutStatus];

export const StockOutType = {
  SALE: "SALE",
  INTERNAL: "INTERNAL",
  TRANSFER: "TRANSFER",
} as const;

export type StockOutType = (typeof StockOutType)[keyof typeof StockOutType];

export interface StockOutItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface StockOutItemForm extends StockOutItem {
  _uid: string;
}

export interface StockOutDetail extends BaseEntity {
  stockOutId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: Product;
}

export interface StockOut extends BaseEntity {
  orderId?: string | null;
  type: StockOutType;
  createdById: string;
  approvedById?: string | null;
  totalAmount: number;
  status: StockOutStatus;
  details: StockOutDetail[];
}

export interface CreateStockOutDto {
  orderId?: string;
  type: StockOutType;
  items: StockOutItem[];
}

export interface UpdateStockOutDto {
  orderId?: string;
  type?: StockOutType;
  items?: StockOutItem[];
}

export interface StockOutQuery {
  status?: StockOutStatus;
  type?: StockOutType;
  fromDate?: string;
  toDate?: string;
}
