import { Router } from "express";
import { scenariosController } from "../controllers/scenariosController.js";

const router = Router();

router.get("/", scenariosController.getAll);
router.post("/", scenariosController.create);
router.put("/:id", scenariosController.update);
router.delete("/:id", scenariosController.remove);
router.post("/:id/evaluate", scenariosController.evaluateById);
router.post("/evaluate", scenariosController.evaluateAdHoc);

export default router;
