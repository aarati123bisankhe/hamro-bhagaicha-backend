import { Router } from "express";
import { EmailController } from "../controllers/email.controller";
import { authorizedMiddleware } from "../middlewares/authorized_middleware";

const router = Router();
const emailController = new EmailController();

router.post(
    "/send-order-confirmation",
    authorizedMiddleware,
    emailController.sendOrderConfirmation,
);

export default router;
