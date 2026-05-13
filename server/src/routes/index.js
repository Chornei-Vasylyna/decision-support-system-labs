import { Router } from "express";
import alternativesRoutes from "./alternativesRoutes.js";
import criteriaRoutes from "./criteriaRoutes.js";

const router = Router();

router.use("/alternatives", alternativesRoutes);
router.use("/criteria", criteriaRoutes);

export default router;
