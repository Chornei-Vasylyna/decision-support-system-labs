import { Router } from "express";
import { alternativesController } from "../controllers/alternativesController.js";

const router = Router();

router.get("/", alternativesController.getAll);
router.post("/", alternativesController.create);
router.put("/:id", alternativesController.update);
router.delete("/:id", alternativesController.remove);

export default router;
