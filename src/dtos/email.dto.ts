import z from "zod";

export const SendOrderConfirmationEmailDto = z.object({
    to: z.email("to must be a valid email"),
    orderId: z.string().min(1, "orderId is required"),
    customerName: z.string().min(1).optional(),
    totalAmount: z.number().positive("totalAmount must be greater than 0").optional(),
    currency: z.string().min(1).default("NPR"),
    subject: z.string().min(1, "subject is required").max(200),
    message: z.string().min(1, "message is required").max(5000),
});

export type SendOrderConfirmationEmailDto = z.infer<
    typeof SendOrderConfirmationEmailDto
>;
