
import { Router } from "express";
import middleware from "../middleware";
import { getSectionController,addStudentsToSectionController,createSectionController,getSectionByIdController, addStudentOnSectionController, getSectionByGradeLevelController, removeStudentsFromSectionController, updateSectionController } from "../controllers/section.controller"

const router = Router();

router.get("/", getSectionController);
router.post("/", createSectionController);
router.get("/:id", getSectionByIdController);
router.post("/addStudent/:id", addStudentOnSectionController);
router.get("/gradeLevel/:id", getSectionByGradeLevelController);
router.post("/addStudents/:id", addStudentsToSectionController);
router.post("/removeStudent/:id", removeStudentsFromSectionController);
router.post("/updateSection/:id", updateSectionController);


export default router;
