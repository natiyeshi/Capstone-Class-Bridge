import { Router } from "express";
import middleware from "../middleware";
import { createMessageController,deleteMessageController,getMessageController } from "../controllers/message.controller"

const router = Router();

router.post("/", createMessageController);
router.get("/", getMessageController);
router.delete("/:id", deleteMessageController);


export default router;
