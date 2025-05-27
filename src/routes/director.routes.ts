import { Router } from "express";
import middleware from "../middleware";
import { 
  createDirectorController,
  getDirectorsController,
  getRelatedUsersController,
  blockUserController,
  unblockUserController, 
  forgetPasswordController,
  getBlockableUsersController
} from "../controllers/director.controller"
import Auth from "../middleware/auth"
const router = Router();

router.post("/", createDirectorController);
router.get("/", getDirectorsController);
router.get("/related-users", Auth.authenticationMiddleWare, getRelatedUsersController);

router.post("/forget-password", 
  Auth.authenticationMiddleWare, 
  Auth.checkRoleMiddleware(['DIRECTOR']), 
  forgetPasswordController
);
// Block/Unblock user routes
router.patch("/:userId/block", Auth.authenticationMiddleWare, blockUserController);
router.patch("/:userId/unblock", Auth.authenticationMiddleWare, unblockUserController);
router.get("/blockable",Auth.authenticationMiddleWare,getBlockableUsersController)

export default router;
