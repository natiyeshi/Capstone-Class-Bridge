import { Router } from "express";
import middleware from "../middleware";
import { createParentController,deleteParentController,addStudentToParentController,getParentByIdController,getParentsController, activateParentController } from "../controllers/parent.controller"
import Auth from "../middleware/auth";
const router = Router();

router.post("/", createParentController);
router.post("/addChildren", addStudentToParentController);
router.get("/", getParentsController);
router.get("/:id", getParentByIdController);
router.delete("/:id", deleteParentController);
router.post("/activate",Auth.authenticationMiddleWare, activateParentController);


export default router;
