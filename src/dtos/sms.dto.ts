import z from "zod";

export const SendOrderConfirmationSmsDto = z.object({
    to: z
        .string()
        .regex(/^\+[1-9]\d{7,14}$/, "Phone number must be in E.164 format, e.g. +97798XXXXXXXX"),
    orderId: z.string().min(1, "orderId is required"),
    customerName: z.string().min(1, "customerName is required").optional(),
    totalAmount: z.number().positive("totalAmount must be greater than 0").optional(),
    currency: z.string().min(1).default("NPR"),
    message: z.string().min(1).max(1600).optional(),
});

export type SendOrderConfirmationSmsDto = z.infer<typeof SendOrderConfirmationSmsDto>;

