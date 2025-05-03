import { Router } from "express";
import { 
    getRoasterController,
    createRoasterController,
    getRoasterByIdController
} from "../controllers/roaster.controller";

const router = Router();

// Get all rosters
router.get("/", getRoasterController);

// Get roster by ID
router.get("/:id", getRoasterByIdController);

// Create or update roster
router.post("/", createRoasterController);

export default router;