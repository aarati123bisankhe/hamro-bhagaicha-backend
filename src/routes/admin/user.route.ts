import { Router } from "express";
import { AdminUserController } from "../../controllers/admin/user.controller";
import { adminMiddleware, authorizedMiddleware } from "../../middlewares/authorized_middleware";
import { uploads } from "../../middlewares/upload_middleware";  // adjust path if needed

const router = Router();
const adminUserController = new AdminUserController();

router.use(authorizedMiddleware);
router.use(adminMiddleware);


router.get("/test", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to admin"
    });
});



router.post("/", adminUserController.createUser);

router.get("/", adminUserController.getAllUser);

router.get("/:id", adminUserController.getUserById);

router.put("/:id",
    uploads.fields([
        { name: "profileUrl", maxCount: 1 },
    ]),
    adminUserController.updateUser
);

router.delete("/:id", adminUserController.deleteUser);

export default router;
