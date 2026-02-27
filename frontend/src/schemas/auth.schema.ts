import { z } from "zod"

export const LoginSchema = z.object({
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

export type LoginValues = z.infer<typeof LoginSchema>

export const RegisterSchema = z.object({
    fullName: z.string().min(3, "Họ tên phải có ít nhất 3 ký tự"),
    email: z.string().email("Email không hợp lệ"),
    password: z.string().min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
})

export type RegisterValues = z.infer<typeof RegisterSchema>