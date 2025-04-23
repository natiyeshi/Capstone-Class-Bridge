import { Router } from "express";
import middleware from "../middleware";
import { createCalendarController,getCalendarController,getCalendarByIdController,deleteCalendarController } from "../controllers/calendar.controller"
import Auth from "../middleware/auth";
const router = Router();

router.post("/", Auth.authenticationMiddleWare,createCalendarController);
router.get("/", Auth.authenticationMiddleWare,getCalendarController);
router.get("/:id", getCalendarByIdController);
router.delete("/:id", deleteCalendarController);


export default router;
