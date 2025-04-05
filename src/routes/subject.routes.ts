
import { Router } from "express";
import middleware from "../middleware";
import { createSubjectController,getSubjectByIdController,getSubjectsController } from "../controllers/subject.controller"

const router = Router();

router.post("/", createSubjectController);
router.get("/", getSubjectsController);
router.get("/:id", getSubjectByIdController);



export default router;
