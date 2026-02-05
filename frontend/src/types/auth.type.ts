export type Role =
    | "ADMIN"
    | "HR_MANAGER"
    | "WAREHOUSE_MANAGER"
    | "SALES_MANAGER"
    | "EMPLOYEE"
    | "CUSTOMER"

export interface LoginRequest {
    email: string
    password: string
}
export interface LoginResponse {
    accessToken: string
    refreshToken: string
    user: {
        id: string
        email: string
        role: Role
        fullName?: string
    }
}

export interface RegisterRequest {
    fullName: string
    email: string
    password: string
}

export interface RegisterResponse {
    accessToken: string
    user: {
        id: string
        email: string
        role: Role
    }
}
