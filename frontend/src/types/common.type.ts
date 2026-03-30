export interface BaseEntity {
    id: string
    createdAt: string
    updatedAt: string
}

export type SortOrder = 'asc' | 'desc'

export interface PaginationMeta {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface BaseFilters {
    page: number
    limit: number
    search: string
    sortBy?: string
    sortOrder?: SortOrder
}

export interface ApiResponse<T> {
    data: T
    message: string
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginationMeta
}

// Backward compatibility aliases.
export type Pagination = PaginationMeta