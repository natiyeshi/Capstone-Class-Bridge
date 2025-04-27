import { Router } from "express";
import middleware from "../middleware";
import { getUsersController,getMe } from "../controllers/user.controller"
import Auth from "../middleware/auth";
const router = Router();

router.get("/", getUsersController);
router.get("/get-me",Auth.authenticationMiddleWare, getMe);


export default router;
