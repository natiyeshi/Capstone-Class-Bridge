
import { Router } from "express";
import middleware from "../middleware";
import { getSectionController,createSectionController,getSectionByIdController } from "../controllers/section.controller"

const router = Router();

router.get("/", getSectionController);
router.post("/", createSectionController);
router.get("/:id", getSectionByIdController);



export default router;
