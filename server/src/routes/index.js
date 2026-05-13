import { Router } from "express";
import alternativesRoutes from "./alternativesRoutes.js";
import analysisRoutes from "./analysisRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";
import evaluationsRoutes from "./evaluationsRoutes.js";
import rulesRoutes from "./rulesRoutes.js";
import thresholdsRoutes from "./thresholdsRoutes.js";
import votingRoutes from "./votingRoutes.js";
import weightsRoutes from "./weightsRoutes.js";

const router = Router();

router.use("/alternatives", alternativesRoutes);
router.use("/criteria", criteriaRoutes);
router.use("/analysis", analysisRoutes);
router.use("/evaluations", evaluationsRoutes);
router.use("/rules", rulesRoutes);
router.use("/thresholds", thresholdsRoutes);
router.use("/voting", votingRoutes);
router.use("/weights", weightsRoutes);

export default router;
