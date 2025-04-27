import { Router } from "express";
import middleware from "../middleware";
import { createCalendarController,getCalendarController,getCalendarByIdController,deleteCalendarController } from "../controllers/calendar.controller"
import Auth from "../middleware/auth";
const router = Router();
// import Auth from "../middleware/auth";
// 
router.post("/", createCalendarController);
router.get("/", getCalendarController);
router.get("/:id", getCalendarByIdController);
router.delete("/:id", deleteCalendarController);


export default router;
