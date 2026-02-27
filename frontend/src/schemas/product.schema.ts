import { z } from "zod"

export const CreateProductSchema = z.object({
    name: z.string().min(2, "Tên sản phẩm phải có ít nhất 2 ký tự"),
    description: z.string().optional(),
    price: z.number().positive("Giá bán phải > 0"),
    costPrice: z.number().positive("Giá nhập phải > 0"),
    stockQuantity: z.number().int().default(0),
    minStock: z.number().int().default(10),
    categoryId: z.string().uuid(),
    supplierId: z.string().uuid(),
})

export type CreateProductValues = z.infer<typeof CreateProductSchema>

export const UpdateProductSchema = CreateProductSchema.partial()

export type UpdateProductValues = z.infer<typeof UpdateProductSchema>