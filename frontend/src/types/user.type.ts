import type { Role } from "./auth.type"

export interface Profile {
    fullName: string
    phone?: string
    address?: string
    avatar?: string
    dateOfBirth?: string
}

export interface User {
    id: string
    email: string
    role: Role
    profile?: Profile
    createdAt: string
}
export interface CreateUserDto {
    email: string;
    password: string;
    role: Role;
    profile: {
        fullName: string;
    };
}
export interface UpdateUserDto {
    email?: string;
    role?: Role;
    profile?: {
        fullName?: string;
    };
}