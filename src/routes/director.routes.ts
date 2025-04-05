import { Router } from "express";
import middleware from "../middleware";
import { createDirectorController,getDirectorsController } from "../controllers/director.controller"

const router = Router();

router.post("/", createDirectorController);
router.get("/", getDirectorsController);


export default router;
