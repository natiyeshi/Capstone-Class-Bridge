import { Router } from "express";
import middleware from "../middleware";
import { createAnnouncementController,getAnnouncementController,getAnnouncementByIdController,deleteAnnouncementController } from "../controllers/announcement.controller"

const router = Router();

router.post("/", createAnnouncementController);
router.get("/", getAnnouncementController);
router.get("/:id", getAnnouncementByIdController);
router.delete("/:id", deleteAnnouncementController);


export default router;
