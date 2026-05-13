import { Router } from "express";
import { explanationController } from "../controllers/explanationController.js";

const router = Router();

router.get("/decision", explanationController.getDecisionExplanation);

export default router;
