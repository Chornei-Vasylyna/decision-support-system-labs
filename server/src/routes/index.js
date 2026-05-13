import { Router } from "express";
import alternativesRoutes from "./alternativesRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";
import evaluationsRoutes from "./evaluationsRoutes.js";
import votingRoutes from "./votingRoutes.js";

const router = Router();

router.use("/alternatives", alternativesRoutes);
router.use("/criteria", criteriaRoutes);
router.use("/evaluations", evaluationsRoutes);
router.use("/voting", votingRoutes);

export default router;
