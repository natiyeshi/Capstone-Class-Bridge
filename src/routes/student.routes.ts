import { Router } from "express";
import middleware from "../middleware";
import { 
  createStudentController,
  deleteStudentController,
  getStudentsController,
  updateStudentController,
  getStudentByIdController,
  getUnassignedStudentsController
} from "../controllers/student.controller"

const router = Router();

router.post("/", createStudentController);
router.get("/unassigned", getUnassignedStudentsController);
router.get("/:id", getStudentByIdController);
router.get("/", getStudentsController);
router.delete("/:id", deleteStudentController);
router.put("/:id", updateStudentController);

export default router;
