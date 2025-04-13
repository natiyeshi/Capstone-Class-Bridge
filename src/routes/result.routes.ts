
import { Router } from "express";
import middleware from "../middleware";
import { deleteResultController, getResultByIdController, getResultsController,updateResultsController } from "../controllers/result.controller"

const router = Router();

router.get("/", getResultsController);
router.post("/", updateResultsController);
router.get("/:id", getResultByIdController);
router.delete("/:id", deleteResultController);



export default router;
