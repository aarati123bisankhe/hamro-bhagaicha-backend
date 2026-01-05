import { Router } from "express";
import { AdminUserController} from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized_middleware";
import { Request, Response } from "express";
import { success } from "zod";

let adminUserController = new AdminUserController();
const router = Router();

//test routes
router.get(
    "/test",
    authorizedMiddleware, adminMiddleware,
    (req: Request, res:Response) => {
        res.status(200).json({success: true, message: "welcome to admin"});
    }
)

router.post("/", adminUserController.createUser);
router.get("/:id", adminUserController.getOneUser);
export default router;
