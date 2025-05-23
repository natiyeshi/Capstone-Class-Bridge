import { Router } from "express";
import middleware from "../middleware";
import { 
  getSectionController,
  addStudentsToSectionController,
  createSectionController,
  getSectionByIdController, 
  addStudentOnSectionController, 
  getSectionByGradeLevelController, 
  removeStudentsFromSectionController, 
  updateSectionController,
  assignTeacherToSectionController, 
  getSectionByRoleController
} from "../controllers/section.controller"
import Auth from "../middleware/auth";

const router = Router();

router.get("/", getSectionController);
router.get("/role",Auth.authenticationMiddleWare, getSectionByRoleController);
router.post("/", createSectionController);
router.get("/:id", getSectionByIdController);
router.post("/addStudent/:id", addStudentOnSectionController);
router.get("/gradeLevel/:id", getSectionByGradeLevelController);
router.post("/addStudents/:id", addStudentsToSectionController);
router.post("/removeStudent/:id", removeStudentsFromSectionController);
router.post("/updateSection/:id", updateSectionController);
router.post("/:id/assign-teacher", assignTeacherToSectionController);

export default router;
