import { Router } from "express";
import middleware from "../middleware";
import { activateTeacherController, createTeacherController,getTeachersController,deleteTeacherController } from "../controllers/teacher.controller"
import Auth from "../middleware/auth";
const router = Router();

router.post("/", createTeacherController);
router.get("/", getTeachersController);
router.post("/activate",Auth.authenticationMiddleWare, activateTeacherController);
router.delete("/:id", deleteTeacherController);



export default router;
