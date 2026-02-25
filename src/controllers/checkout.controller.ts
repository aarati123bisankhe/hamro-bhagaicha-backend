import { Request, Response } from "express";
import z from "zod";
import { sendEmail } from "../configs/email";
import { SendOrderConfirmationEmailDto } from "../dtos/checkout.dto";

const escapeHtml = (value: string) =>
    value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export class CheckoutController {
    async sendOrderConfirmationEmail(req: Request, res: Response) {
        try {
            const parsedData = SendOrderConfirmationEmailDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error),
                });
            }

            const {
                toEmail,
                orderId,
                customerName,
                totalAmount,
                currency,
                items,
                shippingAddress,
                message,
                subject,
            } = parsedData.data;

            const safeCustomerName = customerName ? escapeHtml(customerName) : "Customer";
            const safeOrderId = escapeHtml(orderId);
            const safeCurrency = escapeHtml(currency);
            const safeShippingAddress = shippingAddress ? escapeHtml(shippingAddress) : null;
            const safeMessage = message ? escapeHtml(message) : null;

            const itemsHtml =
                items && items.length > 0
                    ? `
                        <h3>Order Items</h3>
                        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse: collapse; width: 100%;">
                            <thead>
                                <tr>
                                    <th align="left">Item</th>
                                    <th align="right">Qty</th>
                                    <th align="right">Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${items
                                    .map(
                                        (item) => `
                                        <tr>
                                            <td>${escapeHtml(item.name)}</td>
                                            <td align="right">${item.quantity}</td>
                                            <td align="right">${safeCurrency} ${item.price.toFixed(2)}</td>
                                        </tr>`,
                                    )
                                    .join("")}
                            </tbody>
                        </table>
                    `
                    : "";

            const html = `
                <p>Hello ${safeCustomerName},</p>
                <p>Your order has been confirmed.</p>
                <p><strong>Order ID:</strong> ${safeOrderId}</p>
                <p><strong>Total:</strong> ${safeCurrency} ${totalAmount.toFixed(2)}</p>
                ${safeShippingAddress ? `<p><strong>Shipping Address:</strong> ${safeShippingAddress}</p>` : ""}
                ${safeMessage ? `<p>${safeMessage}</p>` : ""}
                ${itemsHtml}
                <p>Thank you for shopping with us.</p>
            `;

            const itemsText =
                items && items.length > 0
                    ? `\nItems:\n${items
                          .map((item) => `- ${item.name} x${item.quantity} (${currency} ${item.price.toFixed(2)})`)
                          .join("\n")}`
                    : "";

            const text = `Hello ${customerName || "Customer"},
Your order has been confirmed.
Order ID: ${orderId}
Total: ${currency} ${totalAmount.toFixed(2)}
${shippingAddress ? `Shipping Address: ${shippingAddress}\n` : ""}${message ? `${message}\n` : ""}${itemsText}

Thank you for shopping with us.`;

            await sendEmail(
                toEmail,
                subject || `Order Confirmation - ${orderId}`,
                html,
                text,
            );

            return res.status(200).json({
                success: true,
                message: "Order confirmation email sent successfully",
                data: {
                    toEmail,
                    orderId,
                },
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}
