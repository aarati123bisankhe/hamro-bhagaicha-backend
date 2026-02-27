import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authorizedMiddleware } from "../middlewares/authorized_middleware";
import { uploads } from "../middlewares/upload_middleware";

let authController = new AuthController();

const router = Router();

router.post("/register", authController.createUser)
router.post("/login", authController.loginUser)

router.get("/whoami", authorizedMiddleware,authController.getUserById)

router.put(
    "/update-profile",
    authorizedMiddleware,
    uploads.fields([
        { name: "profileUrl", maxCount: 1 },
    ]),
    authController.updateUser
)


router.post(
    "/send-reset-password-email",
    authController.requestPasswordChange
)

router.get("/open-reset", authController.openResetLink);
router.post("/reset-password/:token", authController.resetPassword);
router.post("/reset-password-with-code", authController.resetPasswordWithCode);
router.post("/send-sms", authController.sendSmsToNumber);

export default router;
