import { Router } from "express";
import {
  createAttendanceController,
  getAttendanceController,
  getAttendanceByDateController,
  getAttendanceByIdController,
  deleteAttendanceController,
  getStudentAttendanceController,
  getTodayAttendanceController,
  getStudentAttendanceHistoryController
} from "../controllers/attendance.controller";

const router = Router();

router.post("/", createAttendanceController);
router.get("/section/:id", getAttendanceController);
router.get("/section/:id/date", getAttendanceByDateController);
router.get("/student/:id", getStudentAttendanceController);
router.get("/student/:id/history", getStudentAttendanceHistoryController);
router.get("/:id", getAttendanceByIdController);
router.delete("/:id", deleteAttendanceController);
router.get("/today/:id", getTodayAttendanceController);

export default router;
