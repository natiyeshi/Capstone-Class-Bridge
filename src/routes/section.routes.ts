
import { Router } from "express";
import middleware from "../middleware";
import { getSectionController,createSectionController,getSectionByIdController, addStudentOnSectionController, getSectionByGradeLevelController } from "../controllers/section.controller"

const router = Router();

router.get("/", getSectionController);
router.post("/", createSectionController);
router.get("/:id", getSectionByIdController);
router.post("/addStudent/:id", addStudentOnSectionController);
router.get("/gradeLevel/:id", getSectionByGradeLevelController);

export default router;
