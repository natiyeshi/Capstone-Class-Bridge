import { Router } from "express";
import middleware from "../middleware";
import { createMessageController,deleteMessageController,getMessageController,seenMessageController } from "../controllers/message.controller"

const router = Router();

router.post("/", createMessageController);
router.post("/", getMessageController);
router.delete("/:id", deleteMessageController);
router.put("/:id", seenMessageController);



export default router;
