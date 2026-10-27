import express from "express";
import { getMessage, sendMessage, deleteConversation } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRouts.js";

const router = express.Router();
router.post("/send/:id", secureRoute, sendMessage);
router.get("/get/:id", secureRoute, getMessage);
router.delete("/delete/:id", secureRoute, deleteConversation);

export default router;