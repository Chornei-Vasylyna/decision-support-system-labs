import { Router } from "express";
import alternativesRoutes from "./alternativesRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";
import evaluationsRoutes from "./evaluationsRoutes.js";

const router = Router();

router.use("/alternatives", alternativesRoutes);
router.use("/criteria", criteriaRoutes);
router.use("/evaluations", evaluationsRoutes);

export default router;
