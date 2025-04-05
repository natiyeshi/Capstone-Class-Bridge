import { Router } from "express";
import middleware from "../middleware";
import { createAttendanceController,getAttendanceController,getAttendanceByIdController,deleteAttendanceController } from "../controllers/attendance.controller"

const router = Router();

router.post("/", createAttendanceController);
router.get("/", getAttendanceController);
router.get("/:id", getAttendanceByIdController);
router.delete("/:id", deleteAttendanceController);


export default router;
