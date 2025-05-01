
import { Router } from "express";
import middleware from "../middleware";
import { createSubjectController,getSubjectByIdController,getSubjectsController,updateSubjectController,deleteSubjectController } from "../controllers/subject.controller"

const router = Router();

router.post("/", createSubjectController);
router.get("/", getSubjectsController);
router.get("/:id", getSubjectByIdController);
router.put("/:id", updateSubjectController);
router.delete("/:id", deleteSubjectController);

export default router;
