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
    // uploads.single("profileUrl"),
    uploads.fields([
        { name: "profileUrl", maxCount: 1 },
    ]),
    authController.updateUser
)

export default router;