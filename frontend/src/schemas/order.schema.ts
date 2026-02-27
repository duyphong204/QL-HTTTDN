import { z } from "zod"

export const AddToCartSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive("Số lượng phải > 0"),
})

export type AddToCartValues = z.infer<typeof AddToCartSchema>

export const CreateOrderSchema = z.object({
    fullName: z.string().min(2),
    phone: z.string().regex(/^[0-9]{10,}$/),
    address: z.string().min(5),
    paymentMethod: z.enum(["COD", "BANK_TRANSFER"]),
})

export type CreateOrderValues = z.infer<typeof CreateOrderSchema>