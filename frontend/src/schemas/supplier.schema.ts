import z from "zod";

export const CreateSupplierSchema = z.object({
    name: z.string().min(2, "Tên nhà cung cấp phải có ít nhất 2 ký tự"),
    phone: z.string().min(10, "Số điện thoại không hợp lệ"),
    email: z.string().email("Email không hợp lệ").optional(),
    address: z.string().min(5, "Địa chỉ phải có ít nhất 5 ký tự"),
})

export type CreateSupplierValues = z.infer<typeof CreateSupplierSchema>
