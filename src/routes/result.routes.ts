
import { Router } from "express";
import middleware from "../middleware";
import { getResultByIdController, getResultsController,updateResultsController } from "../controllers/result.controller"

const router = Router();

router.get("/", getResultsController);
router.post("/", updateResultsController);
router.get("/:id", getResultByIdController);



export default router;
