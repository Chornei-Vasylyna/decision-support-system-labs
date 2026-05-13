import { Router } from "express";
import { thresholdsController } from "../controllers/thresholdsController.js";

const router = Router();

router.get("/", thresholdsController.getAll);
router.put("/", thresholdsController.upsertMany);
router.get("/feasible", thresholdsController.getFeasibleSet);

export default router;
