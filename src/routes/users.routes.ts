import { Router } from "express";
import middleware from "../middleware";
import { getUsersController } from "../controllers/user.controller"

const router = Router();

router.get("/", getUsersController);


export default router;
