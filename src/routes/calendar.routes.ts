import { Router } from "express";
import middleware from "../middleware";
import { createCalendarController,getCalendarController,getCalendarByIdController,deleteCalendarController } from "../controllers/calendar.controller"

const router = Router();

router.post("/", createCalendarController);
router.get("/", getCalendarController);
router.get("/:id", getCalendarByIdController);
router.delete("/:id", deleteCalendarController);


export default router;
