import { Router } from "express";
import middleware from "../middleware";
import { 
    createParentController,
    deleteParentController,
    getRelatedUsersController,
    addStudentToParentController,
    getParentByIdController,
    getParentsController,
    activateParentController,
    getParentSectionsController,
    getParentGradeLevelsController,
    toggleParentSMSPreferenceController
} from "../controllers/parent.controller"
import Auth from "../middleware/auth";

const router = Router();

router.post("/", createParentController);
router.post("/addChildren", addStudentToParentController);
router.get("/", getParentsController);
router.get("/:id", getParentByIdController);
router.delete("/:id", deleteParentController);
router.post("/activate", Auth.authenticationMiddleWare, activateParentController);
router.get("/:id/related-users", getRelatedUsersController);
router.get("/:id/sections", getParentSectionsController);
router.get("/:id/grade-levels", getParentGradeLevelsController);
router.post("/toggle-sms/:id",toggleParentSMSPreferenceController)


export default router;
