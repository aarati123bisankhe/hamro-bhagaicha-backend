import { Router } from "express";
import { NurseryController } from "../controllers/nursery.controller";

const router = Router();
const nurseryController = new NurseryController();

router.get("/", nurseryController.getNurseries);

export default router;
