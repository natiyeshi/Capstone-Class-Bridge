import { Router } from "express";
import middleware from "../middleware";
import { createDirectorController,getDirectorsController,getRelatedUsersController } from "../controllers/director.controller"

const router = Router();

router.post("/", createDirectorController);
router.get("/", getDirectorsController);
router.get("/related-users", getRelatedUsersController);


export default router;
