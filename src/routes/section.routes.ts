
import { Router } from "express";
import middleware from "../middleware";
import { getSectionController,createSectionController,getSectionByIdController, addStudentOnSectionController } from "../controllers/section.controller"

const router = Router();

router.get("/", getSectionController);
router.post("/", createSectionController);
router.get("/:id", getSectionByIdController);

router.post("/addStudent/:id", addStudentOnSectionController);


export default router;
