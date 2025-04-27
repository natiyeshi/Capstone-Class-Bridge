import { Router } from "express";
import middleware from "../middleware";
import { getUsersController,getMe, updateUser } from "../controllers/user.controller"
import Auth from "../middleware/auth";
const router = Router();

router.get("/", getUsersController);
router.get("/get-me",Auth.authenticationMiddleWare, getMe);
router.get("/update",Auth.authenticationMiddleWare, updateUser);


export default router;
