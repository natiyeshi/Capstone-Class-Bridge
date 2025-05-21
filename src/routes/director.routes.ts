import { Router } from "express";
import middleware from "../middleware";
import { createDirectorController,getDirectorsController,getRelatedUsersController } from "../controllers/director.controller"
import Auth from "../middleware/auth"
const router = Router();

router.post("/", createDirectorController);
router.get("/", getDirectorsController);
router.get("/related-users",Auth.authenticationMiddleWare,getRelatedUsersController);


export default router;
