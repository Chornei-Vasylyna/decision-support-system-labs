import { Router } from "express";
import { votingController } from "../controllers/votingController.js";

const router = Router();

router.get("/", votingController.getAll);
router.post("/", votingController.createVotes);
router.get("/method/simple-majority", votingController.simpleMajority);
router.get("/method/borda-count", votingController.bordaCount);
router.get("/method/condorcet", votingController.condorcet);
router.get("/method/approval", votingController.approvalVoting);
router.post("/import-google", votingController.importFromGoogle);
router.delete("/:voterId", votingController.removeByVoter);

export default router;
