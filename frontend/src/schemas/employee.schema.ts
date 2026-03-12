import { z } from "zod"

export const CreateEmployeeSchema = z.object({
    userId: z.string().uuid(),
    department: z.string().optional(),
    position: z.string().optional(),
    baseSalary: z.number().positive(),
    joinDate: z.coerce.date(),
})

export type CreateEmployeeValues = z.infer<typeof CreateEmployeeSchema>

export const CreateLeaveRequestSchema = z
  .object({
    startDate: z.string().min(1, "Vui lòng chọn ngày bắt đầu"),
    endDate: z.string().min(1, "Vui lòng chọn ngày kết thúc"),
    type: z.enum(["SICK", "ANNUAL", "MATERNITY", "RESIGNATION"], {
      required_error: "Vui lòng chọn loại đơn",
    }),
    reason: z.string().min(10, "Lý do phải ít nhất 10 ký tự"),
  })
  .refine(
    (data) => new Date(data.endDate) >= new Date(data.startDate),
    { 
      message: "Ngày kết thúc phải sau hoặc bằng ngày bắt đầu", 
      path: ["endDate"] 
    }
  )

export type CreateLeaveRequestValues = z.infer<typeof CreateLeaveRequestSchema>

export const UpdateProfileSchema = z.object({
    fullName: z.string().min(3, "Họ tên phải từ 3 ký tự trở lên"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ").optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
});

export type UpdateProfileValues = z.infer<typeof UpdateProfileSchema>;