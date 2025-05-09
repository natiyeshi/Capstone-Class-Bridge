import { Router } from "express";
// import { auth } from "../middlewares";
import {
  createGradeLevelMessageController,
  getGradeLevelMessagesController,
  updateGradeLevelMessageController,
  deleteGradeLevelMessageController,
  getGradeLevelUsersController,
} from "../controllers/gradeLevelMessage.controller";

const router = Router();

router.post("/", createGradeLevelMessageController);
router.get("/grade-level/:id", getGradeLevelMessagesController);
router.get("/grade-level/:id/users", getGradeLevelUsersController);
router.put("/:id", updateGradeLevelMessageController);
router.delete("/:id", deleteGradeLevelMessageController);

export default router; 