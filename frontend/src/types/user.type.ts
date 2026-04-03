import type { Role } from "./auth.type"

export interface Profile {
    id?: string
    userId?: string
    fullName: string
    phone?: string
    address?: string
    avatar?: string
    dateOfBirth?: string
    createdAt?: Date
    updatedAt?: Date
}

export interface User {
    id: string
    email: string
    role: Role
    profile?: Profile
    isActive?: boolean
    deletedAt?: string | null
    createdAt: string
    updatedAt: string
}

export interface CreateUserDto {
    email: string
    password: string
    role: Role
    profile: {
        fullName: string
        phone?: string
        address?: string
        avatar?: string
        dateOfBirth?: string
    }
}

export interface UpdateUserDto {
    email?: string
    role?: Role
    profile?: {
        fullName?: string
        phone?: string
        address?: string
        avatar?: string
        dateOfBirth?: string
    }
}

// Nhân viên tự update thông tin cá nhân
export interface UpdateProfileDto {
    fullName?: string
    phone?: string
    address?: string
    avatar?: string
    dateOfBirth?: string
}