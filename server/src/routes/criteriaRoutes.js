import { Router } from "express";

import { criteriaController } from "../controllers/criteriaController.js";

const router = Router();

router.get("/", criteriaController.getAll);
router.post("/", criteriaController.create);
router.put("/:id", criteriaController.update);
router.delete("/:id", criteriaController.remove);

export default router;
