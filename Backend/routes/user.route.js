import express from "express"
import { logout, login, signup, allUsers, updateProfile, deleteAccount } from "../controller/user.controller.js"
import secureRoute from "../middleware/secureRouts.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/allusers", secureRoute, allUsers);
router.put("/profile", secureRoute, updateProfile);
router.delete("/account", secureRoute, deleteAccount);

export default router;