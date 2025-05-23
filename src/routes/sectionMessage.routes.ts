import { Router } from "express";
import middleware from "../middleware";
import { createSectionMessageController, deleteSectionMessageController, getSectionMessageController, updateSectionMessageController, getSectionMessageBySectionIdController } from "../controllers/sectionMessage.controller"

const router = Router();

router.post("/", createSectionMessageController);
router.get("/", getSectionMessageController);
router.delete("/:id", deleteSectionMessageController);
router.put("/:id", updateSectionMessageController);
router.get("/section/:id", getSectionMessageBySectionIdController);

export default router;
