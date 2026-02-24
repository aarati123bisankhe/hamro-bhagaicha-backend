import { Router } from "express";
import { SmsController } from "../controllers/sms.controller";

const router = Router();
const smsController = new SmsController();

router.post("/send-order-confirmation", smsController.sendOrderConfirmation);

export default router;

