import express from "express";
import { sendMessage } from "../controller/message.controller.js";
import secureRoute from "../middleware/secureRouts.js";

const router = express.Router();
router.post("/send/:id",secureRoute,sendMessage);

export default router;