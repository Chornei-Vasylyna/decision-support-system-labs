import { Router } from "express";
import { rulesController } from "../controllers/rulesController.js";

const router = Router();

router.get("/", rulesController.getAll);
router.post("/", rulesController.create);
router.put("/:id", rulesController.update);
router.delete("/:id", rulesController.remove);
router.post("/apply", rulesController.apply);

export default router;
