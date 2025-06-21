import express from "express";
import { login, logout, signupStudent, signupFaculty} from "../controllers/auth.controller.js";
import { protectRoute} from "../middleware/auth.middleware.js";
import { allowOnly } from "../middleware/roleCheck.middleware.js";

const router = express.Router();

router.post("/login", login);
router.post("/student/signup", signupStudent);
router.post("/faculty/signup", signupFaculty);
router.post("/logout", logout);

// check if user is logged in
router.get("/me", protectRoute, (req, res) => {
  res.status(200).json({ success: true, user: req.user, role: req.user.role });
});

export default router;