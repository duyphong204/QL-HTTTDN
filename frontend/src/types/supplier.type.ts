export interface Supplier {
    id: string;
    name: string;
    address: string;
    phone: string;
    email: string;
    contactPerson: string;
    createdAt: string;
}

export interface CreateSupplierDto {
    name: string;
    contactPerson: string;
    phone: string;
    email: string;
    address: string;
}

export interface UpdateSupplierDto {
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
}