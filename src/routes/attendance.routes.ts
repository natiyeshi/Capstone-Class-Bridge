import { Router } from "express";
import {
  createAttendanceController,
  getAttendanceController,
  getAttendanceByDateController,
  getAttendanceByIdController,
  deleteAttendanceController,
  getStudentAttendanceController
} from "../controllers/attendance.controller";

const router = Router();

router.post("/", createAttendanceController);
router.get("/section/:id", getAttendanceController);
router.get("/section/:id/date", getAttendanceByDateController);
router.get("/student/:id", getStudentAttendanceController);
router.get("/:id", getAttendanceByIdController);
router.delete("/:id", deleteAttendanceController);

export default router;
