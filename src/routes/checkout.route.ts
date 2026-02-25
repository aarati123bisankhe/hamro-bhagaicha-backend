import { Router } from "express";
import { CheckoutController } from "../controllers/checkout.controller";

const router = Router();
const checkoutController = new CheckoutController();

router.post(
    "/send-order-confirmation-email",
    checkoutController.sendOrderConfirmationEmail,
);

export default router;
