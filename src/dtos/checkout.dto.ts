import z from "zod";

const CheckoutOrderItemDto = z.object({
    name: z.string().min(1, "item name is required"),
    quantity: z.number().int("quantity must be an integer").positive("quantity must be greater than 0"),
    price: z.number().nonnegative("price must be 0 or greater"),
});

export const SendOrderConfirmationEmailDto = z.object({
    toEmail: z.email("toEmail must be a valid email"),
    orderId: z.string().min(1, "orderId is required"),
    customerName: z.string().min(1, "customerName is required").optional(),
    totalAmount: z.number().positive("totalAmount must be greater than 0"),
    currency: z.string().min(1).default("NPR"),
    items: z.array(CheckoutOrderItemDto).optional(),
    shippingAddress: z.string().min(1).optional(),
    message: z.string().min(1).max(2000).optional(),
    subject: z.string().min(1).max(200).optional(),
});

export type SendOrderConfirmationEmailDto = z.infer<typeof SendOrderConfirmationEmailDto>;
