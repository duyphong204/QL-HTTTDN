import type { BaseEntity } from "./common.type"
import type { User } from "./user.type"

export interface SystemLog extends BaseEntity {
    action: string
    details?: string
    user?: User
}
