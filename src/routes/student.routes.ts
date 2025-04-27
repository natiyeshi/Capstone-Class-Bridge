import { Router } from "express";
import middleware from "../middleware";
import { createStudentController,deleteStudentController,getStudentsController } from "../controllers/student.controller"

const router = Router();

router.post("/", createStudentController);
router.get("/", getStudentsController);
router.delete("/:id", deleteStudentController);


export default router;
