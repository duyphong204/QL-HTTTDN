export interface BaseEntity {
    id: string
    createdAt?: string
    updatedAt?: string
}

export interface Pagination {
    page: number
    limit: number
}

export interface ApiResponse<T> {
    data: T
    message: string
}
