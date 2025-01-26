import express from "express";
import {
  loginUser,
  registerUser,
  updateUser,
  logoutUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middleware/authToken.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.put("/update/:id", verifyToken, updateUser);
export default router;
