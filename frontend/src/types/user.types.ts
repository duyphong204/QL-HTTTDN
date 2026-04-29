import type { Role } from "./auth.types"

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
    profile?: {
        fullName?: string
        phone?: string
        address?: string
        avatar?: string
        dateOfBirth?: string
    }
}

export interface UpdateProfileDto {
    fullName?: string
    phone?: string
    address?: string
    avatar?: string
    dateOfBirth?: string
}
