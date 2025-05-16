import { Router } from "express";
import middleware from "../middleware";
import { 
    createMessageController,
    deleteMessageController,
    getMessageController,
    seenMessageController,
    getUnreadMessagesController 
} from "../controllers/message.controller";

const router = Router();

router.post("/", createMessageController);
router.get("/", getMessageController);
router.get("/unread/:id", getUnreadMessagesController);
router.delete("/:id", deleteMessageController);
router.put("/:id", seenMessageController);

export default router;
