import { Router } from "express";
import middleware from "../middleware";
import { createSectionMessageController,deleteSectionMessageController,getSectionMessageController } from "../controllers/sectionMessage.controller"

const router = Router();

router.post("/", createSectionMessageController);
router.get("/", getSectionMessageController);
router.delete("/:id", deleteSectionMessageController);


export default router;
