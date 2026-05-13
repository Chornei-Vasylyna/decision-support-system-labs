import { Router } from "express";
import { analysisController } from "../controllers/analysisController.js";

const router = Router();

router.get("/ranking", analysisController.getRanking);

export default router;
