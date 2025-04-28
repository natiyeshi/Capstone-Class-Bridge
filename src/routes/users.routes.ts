import { Router } from "express";
import middleware from "../middleware";
import { getUsersController,getMe, updateUser, updateMe } from "../controllers/user.controller"
import Auth from "../middleware/auth";
const router = Router();

router.get("/", getUsersController);
router.get("/get-me",Auth.authenticationMiddleWare, getMe);
router.put("/update/:id", updateUser);
router.put("/update-me",Auth.authenticationMiddleWare, updateMe);


export default router;
