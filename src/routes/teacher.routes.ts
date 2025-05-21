import { Router } from "express";
import middleware from "../middleware";
import { 
  activateTeacherController, 
  createTeacherController,
  getTeachersController,
  deleteTeacherController,
  getTeachersByIdController, 
  getRelatedUsersController,
  getTeacherSubjectsController,
} from "../controllers/teacher.controller"
import Auth from "../middleware/auth";

const router = Router();

router.post("/", createTeacherController);
router.get("/", getTeachersController);
router.get("/:id", getTeachersByIdController);
router.post("/activate", Auth.authenticationMiddleWare, activateTeacherController);
router.delete("/:id", deleteTeacherController);
router.get("/:id/related-users", getRelatedUsersController);
router.get("/:id/subjects", getTeacherSubjectsController);

export default router;
