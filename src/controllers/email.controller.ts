import { Request, Response } from "express";
import z from "zod";
import { sendEmail } from "../configs/email";
import { SendOrderConfirmationEmailDto } from "../dtos/email.dto";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");

export class EmailController {
    async sendOrderConfirmation(req: Request, res: Response) {
        try {
            const parsedData = SendOrderConfirmationEmailDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error),
                });
            }

            const {
                to,
                orderId,
                customerName,
                totalAmount,
                currency,
                subject,
                message,
            } = parsedData.data;

            const safeCustomerName = customerName ? escapeHtml(customerName) : "Customer";
            const safeOrderId = escapeHtml(orderId);
            const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");
            const safeCurrency = escapeHtml(currency);

            const totalLine =
                typeof totalAmount === "number"
                    ? `<p><strong>Total:</strong> ${safeCurrency} ${totalAmount.toFixed(2)}</p>`
                    : "";

            const html = `
                <p>Hello ${safeCustomerName},</p>
                <p>Your order has been confirmed.</p>
                <p><strong>Order ID:</strong> ${safeOrderId}</p>
                ${totalLine}
                <p>${safeMessage}</p>
                <p>Thank you for shopping with us.</p>
            `;

            await sendEmail(to, subject, html, message);

            return res.status(200).json({
                success: true,
                message: "Order confirmation email sent.",
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
