import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
let authCintroller = new AuthController();

const router = Router();

router.post("/register", authCintroller.createUser)
router.post("/login", authCintroller.loginUser)
export default router;