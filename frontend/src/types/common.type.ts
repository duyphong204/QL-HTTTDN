export interface BaseEntity {
    id: string
    createdAt: string
    updatedAt: string
}

export interface Pagination {
    page: number
    limit: number
    total: number
    totalPages: number
}

export interface ApiResponse<T> {
    data: T
    message: string
}
export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
    }
    message: string
}