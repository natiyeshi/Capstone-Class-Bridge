import { Router } from "express";
import middleware from "../middleware";
import { activateTeacherController, createTeacherController,getTeachersController } from "../controllers/teacher.controller"
import Auth from "../middleware/auth";
const router = Router();

router.post("/", createTeacherController);
router.get("/", getTeachersController);
router.post("/activate",Auth.authenticationMiddleWare, activateTeacherController);



export default router;
