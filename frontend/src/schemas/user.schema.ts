import { z } from "zod";
import { emailSchema, passwordSchema } from "./common.schema";

const roleSchema = z.enum([
  "ADMIN",
  "HR_MANAGER",
  "WAREHOUSE_MANAGER",
  "SALES_MANAGER",
  "EMPLOYEE",
  "CUSTOMER",
]);

export const CreateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
  profile: z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
    phone: z.string().optional(),
    address: z.string().optional(),
    avatar: z.string().optional(),
    dateOfBirth: z.string().optional(),
  }),
});

export type CreateUserValues = z.infer<typeof CreateUserSchema>;

export const UpdateUserSchema = z.object({
  email: emailSchema,
  role: roleSchema,
  profile: z.object({
    fullName: z.string().min(2, "Họ tên phải có ít nhất 2 ký tự"),
  }),
});

export type UpdateUserValues = z.infer<typeof UpdateUserSchema>;