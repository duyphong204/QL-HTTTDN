import type { BaseEntity } from "./common.type"

export interface Supplier extends BaseEntity {
    name: string
    address?: string
    phone?: string
    email?: string
  //  contactPerson?: string
}

export interface CreateSupplierDto {
    name: string
   // contactPerson?: string
    phone?: string
    email?: string
    address?: string
}

export interface UpdateSupplierDto {
    name?: string
   // contactPerson?: string
    phone?: string
    email?: string
    address?: string
}