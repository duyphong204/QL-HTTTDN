import type { Role } from "./auth.type"
import type { BaseEntity } from "./common.type"

export interface Profile {
    fullName: string
    phone?: string
    address?: string
    avatar?: string
    dateOfBirth?: string
}

export interface User extends BaseEntity {
    email: string
    role: Role
    profile?: Profile
}
