import { z } from "zod"

// Common patterns
export const emailSchema = z
    .string()
    .email("Email không hợp lệ")
    .min(5, "Email quá ngắn")

export const passwordSchema = z
    .string()
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự")
    .regex(/[0-9]/, "Mật khẩu phải có ít nhất 1 chữ số")

export const phoneSchema = z
    .string()
    .regex(/^[0-9]{10,}$/, "Số điện thoại không hợp lệ")
    .optional()

export const uuidSchema = z.string().uuid("ID không hợp lệ")