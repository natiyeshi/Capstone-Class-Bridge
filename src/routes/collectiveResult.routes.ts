import { Router } from "express";
import middleware from "../middleware";
import { getCollectiveResultsController } from "../controllers/collectiveResult.controller"

const router = Router();

router.get("/", getCollectiveResultsController);
// router.post("/", getCollectiveResultController);
// router.get("/:id", getCollectiveResultByIdController);
// router.delete("/:id", deleteCollectiveResultController);


export default router;
