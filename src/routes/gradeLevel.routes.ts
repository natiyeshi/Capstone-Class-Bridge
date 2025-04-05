import { Router } from "express";
import middleware from "../middleware";
import { createGradeLevelController,deleteGradeLevelController,getGradeLevelByIdController,getGradeLevelController, updategradeLevelController } from "../controllers/gradeLevel.controller"

const router = Router();

router.post("/", createGradeLevelController);
router.get("/", getGradeLevelController);
router.get("/:id", getGradeLevelByIdController);
router.patch("/:id",updategradeLevelController)
router.delete("/:id",deleteGradeLevelController)

export default router;
