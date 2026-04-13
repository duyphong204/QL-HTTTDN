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

export interface ApiEnvelope<T> {
    success: true
    data: T
    meta?: PaginationMeta | null
    message?: string | string[]
    timestamp?: string
}

export interface ApiErrorResponse {
    success?: false
    statusCode: number
    error?: string
    message?: string | string[] | Record<string, string | string[]>
    path?: string
    timestamp?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    meta: PaginationMeta
}

export type Pagination = PaginationMeta