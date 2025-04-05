import { Router } from "express";
import middleware from "../middleware";
import { createTeacherController,getTeachersController } from "../controllers/teacher.controller"

const router = Router();

router.post("/", createTeacherController);
router.get("/", getTeachersController);


export default router;
