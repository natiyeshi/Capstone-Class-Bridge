
import { Router } from "express";
import middleware from "../middleware";
import { deleteResultController, getResultByIdController,getStudentResultsController, getResultsController,updateResultsController, getStudentsResultsController } from "../controllers/result.controller"

const router = Router();

router.get("/", getResultsController);
router.post("/", updateResultsController);
router.get("/:id", getResultByIdController);
router.delete("/:id", deleteResultController);
router.get("/student/:id", getStudentResultsController);
// router.get("/subject/:id", getStudentsResultsController);



export default router;
