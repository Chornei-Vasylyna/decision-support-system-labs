import { Router } from "express";
import { weightsController } from "../controllers/weightsController.js";

const router = Router();

router.get("/", weightsController.getAll);
router.patch("/", weightsController.updateMany);
router.post("/apply-voting", weightsController.applyVotingResults);

export default router;
