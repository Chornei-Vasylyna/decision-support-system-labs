import { Router } from "express";
import { evaluationsController } from "../controllers/evaluationsController.js";

const router = Router();

router.get("/", evaluationsController.getAll);
router.get("/matrix", evaluationsController.getMatrix);
router.put("/matrix", evaluationsController.upsertMany);
router.post("/import-google", evaluationsController.importFromGoogle);
router.delete("/:id", evaluationsController.removeById);

export default router;
