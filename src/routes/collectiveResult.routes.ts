import { Router } from "express";
import middleware from "../middleware";
import { 
  createCollectiveResultsController, 
  getCollectiveResultByIdController, 
  getCollectiveResultsController,
  getCollectiveResultByStudentIdController,
  createSectionCollectiveResultsController,
  getCollectiveResultsBySectionController,
  updateCollectiveResultFeedbackController
} from "../controllers/collectiveResult.controller"

const router = Router();

router.get("/", getCollectiveResultsController);
router.post("/:id", createCollectiveResultsController);
router.get("/:id", getCollectiveResultByIdController);
router.get("/student/:id", getCollectiveResultByStudentIdController);
router.post("/section/:id", createSectionCollectiveResultsController);
router.get("/section/:id", getCollectiveResultsBySectionController);
router.patch("/feedback/:id", updateCollectiveResultFeedbackController);

export default router;
