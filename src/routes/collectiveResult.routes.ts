import { Router } from "express";
import middleware from "../middleware";
import { createCollectiveResultsController, getCollectiveResultByIdController, getCollectiveResultsController } from "../controllers/collectiveResult.controller"

const router = Router();

router.get("/", getCollectiveResultsController);
router.post("/", createCollectiveResultsController);
router.get("/:id", getCollectiveResultByIdController);
// router.delete("/:id", deleteCollectiveResultController);


export default router;
