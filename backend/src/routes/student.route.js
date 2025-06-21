import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { allowOnly } from '../middleware/roleCheck.middleware.js';
import {
  getStudentDetails,
  getStudentProfile,
  updateStudentProfile,
  enrollInCourse,
  getAttendanceRecords,
  getAllAttendanceRecords
} from '../controllers/student.controller.js';

const router = express.Router();

router.use(protectRoute, allowOnly('student'));

router.get("/home", getStudentDetails);
router.get("/profile", getStudentProfile);
router.put("/profile", updateStudentProfile);
router.post("/courses/enroll/:courseId", enrollInCourse);
router.get("/courses/:courseId/attendance", getAttendanceRecords);
router.get("/attendance", getAllAttendanceRecords);


export default router;