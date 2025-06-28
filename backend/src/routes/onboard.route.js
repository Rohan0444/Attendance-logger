import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { allowOnly } from "../middleware/roleCheck.middleware.js";
import { onboardStudent, onboardFaculty } from "../controllers/onboard.controller.js";


const router = express.Router();

// Students must have valid JWT with role="student"
router.get("/student",(req,res)=>{
    res.render("Students/student-onboard.ejs")
})
router.post("/student",
  protectRoute,
  allowOnly("student"),
  onboardStudent
);

// Faculty must have valid JWT with role="faculty"
router.get("/faculty",(req,res)=>{
    res.render("faculty/faculty-onboard.ejs")
})
router.post("/faculty",
  protectRoute,
  allowOnly("faculty"),
  onboardFaculty
);

export default router;
