import type { BaseEntity } from "./common.types";

export interface Supplier extends BaseEntity {
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
}

export interface CreateSupplierDto {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
}

export interface UpdateSupplierDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
}
