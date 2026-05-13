import { Router } from "express";
import { sensitivityController } from "../controllers/sensitivityController.js";

const router = Router();

router.post("/weights", sensitivityController.analyzeWeights);

export default router;
