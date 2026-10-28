import express from "express";
import { getMessage, sendMessage, deleteConversation, deleteMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRouts.js";

const router = express.Router();
router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:id", secureRoute, getMessage);
router.delete("/delete/:id", secureRoute, deleteConversation);
router.delete("/deleteMessage/:id", secureRoute, deleteMessage);

export default router;