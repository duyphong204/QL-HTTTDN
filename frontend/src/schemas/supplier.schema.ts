import z from "zod";

export const CreateSupplierSchema = z.object({
  name: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),

  phone: z
    .string()
    .min(10, "Số điện thoại không hợp lệ")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .email("Email không hợp lệ")
    .optional()
    .or(z.literal("")),

  address: z
    .string()
    .min(5, "Địa chỉ phải có ít nhất 5 ký tự")
    .optional()
    .or(z.literal("")),
});

export type CreateSupplierValues = z.infer<typeof CreateSupplierSchema>;