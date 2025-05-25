import { Router } from "express";
import {
  getNotificationsController,
  getNotificationByIdController,
  createNotificationController,
  updateNotificationController,
  deleteNotificationController,
  deleteManyNotificationController,
  seenNotificationsController,
} from "../controllers/notification.controller";
import Auth from "../middleware/auth";

const router = Router();

router.delete("/all", Auth.authenticationMiddleWare, deleteManyNotificationController);
// Get all notifications
router.get("/", Auth.authenticationMiddleWare, getNotificationsController);

router.post("/seen-all", Auth.authenticationMiddleWare, seenNotificationsController);

// Get notification by ID
router.get("/:id", Auth.authenticationMiddleWare, getNotificationByIdController);

// Create new notification
router.post("/", Auth.authenticationMiddleWare, createNotificationController);

// Delete notification
router.delete("/:id", Auth.authenticationMiddleWare, deleteNotificationController);



export default router; 