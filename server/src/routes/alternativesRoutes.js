import { Router } from "express";
import { alternativesController } from "../controllers/alternativesController.js";

const router = Router();

router.get("/", alternativesController.getAll);
router.post("/", alternativesController.create);
router.delete("/:id", alternativesController.remove);

export default router;
