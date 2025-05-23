import { Router } from "express";
import middleware from "../middleware";
import { 
  createDirectorController,
  getDirectorsController,
  getRelatedUsersController,
  blockUserController,
  unblockUserController 
} from "../controllers/director.controller"
import Auth from "../middleware/auth"
const router = Router();

router.post("/", createDirectorController);
router.get("/", getDirectorsController);
router.get("/related-users", Auth.authenticationMiddleWare, getRelatedUsersController);

// Block/Unblock user routes
router.patch("/:userId/block", Auth.authenticationMiddleWare, blockUserController);
router.patch("/:userId/unblock", Auth.authenticationMiddleWare, unblockUserController);

export default router;
