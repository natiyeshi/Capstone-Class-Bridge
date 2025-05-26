import { Router } from "express";
import middleware from "../middleware";
import { 
  getUsersController,
  getMe, 
  updateUser, 
  updateMe,
  deleteUserController, 
  getUserById,
  sendVerificationOTPController,
  verifyPhoneNumberController,
  changePasswordController
} from "../controllers/user.controller"
import Auth from "../middleware/auth";

const router = Router();

router.get("/", getUsersController);
router.get("/get-me",Auth.authenticationMiddleWare, getMe);
router.put("/update/:id", updateUser);
router.put("/update-me",Auth.authenticationMiddleWare, updateMe);
router.delete("/:id", deleteUserController);
router.get("/:id", getUserById);
router.post("/change-password", Auth.authenticationMiddleWare,changePasswordController);

// Phone verification routes
router.post("/verify-phone/send", Auth.authenticationMiddleWare, sendVerificationOTPController);
router.post("/verify-phone/verify", Auth.authenticationMiddleWare, verifyPhoneNumberController);

export default router;
