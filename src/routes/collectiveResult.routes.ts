import { Router } from "express";
import middleware from "../middleware";
import { 
  createCollectiveResultsController, 
  getCollectiveResultByIdController, 
  getCollectiveResultsController,
  getCollectiveResultByStudentIdController 
} from "../controllers/collectiveResult.controller"

const router = Router();

router.get("/", getCollectiveResultsController);
router.post("/:id", createCollectiveResultsController);
router.get("/:id", getCollectiveResultByIdController);
router.get("/student/:id", getCollectiveResultByStudentIdController);


export default router;
