import { Router } from "express";
import middleware from "../middleware";
import { createStudentController,getStudentsController } from "../controllers/student.controller"

const router = Router();

router.post("/", createStudentController);
router.get("/", getStudentsController);


export default router;
