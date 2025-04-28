import { Router } from "express";
import {
    signUpController,
    signInController
} from "../controllers/auth.controller";
import middleware from "../middleware";

const router = Router();

// router.post("/sign-up", signUpController);
router.post("/sign-in", signInController);
// router.patch(
//   "/change-password",
//   changePasswordController
// );

// router.get("/verify",  verifyUser);

// router.patch(
//   "/role",
//   updateROLEController
// );

export default router;
