import { z } from "zod"

export const CreateEmployeeSchema = z.object({
    userId: z.string().uuid(),
    code: z.string().min(3),
    department: z.string().optional(),
    position: z.string().optional(),
    baseSalary: z.number().positive(),
    joinDate: z.coerce.date(),
})

export type CreateEmployeeValues = z.infer<typeof CreateEmployeeSchema>

export const CreateLeaveRequestSchema = z.object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
    type: z.enum(["SICK", "ANNUAL", "MATERNITY"]),
    reason: z.string().min(10),
})

export type CreateLeaveRequestValues = z.infer<typeof CreateLeaveRequestSchema>