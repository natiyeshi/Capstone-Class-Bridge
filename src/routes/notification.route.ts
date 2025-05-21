import { Router } from "express";
import {
  getNotificationsController,
  getNotificationByIdController,
  createNotificationController,
  updateNotificationController,
  deleteNotificationController,
} from "../controllers/notification.controller";
import Auth from "../middleware/auth";

const router = Router();

// Get all notifications
router.get("/", Auth.authenticationMiddleWare, getNotificationsController);

// Get notification by ID
router.get("/:id", Auth.authenticationMiddleWare, getNotificationByIdController);

// Create new notification
router.post("/", Auth.authenticationMiddleWare, createNotificationController);

// Update notification
router.patch("/:id", Auth.authenticationMiddleWare, updateNotificationController);

// Delete notification
router.delete("/:id", Auth.authenticationMiddleWare, deleteNotificationController);

export default router; 