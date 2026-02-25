import { Router } from "express";
import { ProductController } from "../controllers/product.controller";

const router = Router();
const productController = new ProductController();

router.post("/", productController.addProduct);
router.get("/inventory", productController.getInventory);
router.delete("/:productId", productController.deleteProduct);

export default router;
