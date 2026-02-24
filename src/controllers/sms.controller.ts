import { Request, Response } from "express";
import z from "zod";
import { sendSms } from "../configs/sms";
import { SendOrderConfirmationSmsDto } from "../dtos/sms.dto";

export class SmsController {
    async sendOrderConfirmation(req: Request, res: Response) {
        try {
            const parsedData = SendOrderConfirmationSmsDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error),
                });
            }

            const { to, orderId, customerName, totalAmount, currency, message } = parsedData.data;
            const smsBody =
                message ||
                `Order confirmed${customerName ? ` for ${customerName}` : ""}. Order ID: ${orderId}${
                    totalAmount ? `, Total: ${currency} ${totalAmount}` : ""
                }. Thank you for shopping with us.`;

            const smsResult = await sendSms({ to, message: smsBody });

            return res.status(200).json({
                success: true,
                message: "Order confirmation SMS sent successfully",
                data: smsResult,
            });
        } catch (error: Error | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal Server Error",
            });
        }
    }
}

