import { Router } from "express";
import middleware from "../middleware";
import { createParentController,getParentsController } from "../controllers/parent.controller"

const router = Router();

router.post("/", createParentController);
router.get("/", getParentsController);


export default router;
