import { Router } from "express";
import alternativesRoutes from "./alternativesRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";
import evaluationsRoutes from "./evaluationsRoutes.js";
import votingRoutes from "./votingRoutes.js";
import weightsRoutes from "./weightsRoutes.js";

const router = Router();

router.use("/alternatives", alternativesRoutes);
router.use("/criteria", criteriaRoutes);
router.use("/evaluations", evaluationsRoutes);
router.use("/voting", votingRoutes);
router.use("/weights", weightsRoutes);

export default router;
