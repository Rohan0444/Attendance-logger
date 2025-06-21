import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { allowOnly } from '../middleware/roleCheck.middleware.js';
import {
  getFacultyHome,
  getFacultyProfile,
  updateFacultyProfile,
  createCourse,
  deleteCourse,
  removeStudentFromCourse,
  startAttendance,
  getCourseJoinRequests,
  approveCourseRequest,
  rejectCourseRequest
} from '../controllers/faculty.controller.js';

const router = express.Router();

router.use(protectRoute, allowOnly("faculty"));

// Home / Dashboard
router.get("/home", getFacultyHome);

// Profile
router.get("/profile", getFacultyProfile);
router.put("/profile", updateFacultyProfile);

// Courses
router.post("/course", createCourse);                            // Create new course
router.delete("/courses/:courseId", deleteCourse);                // Delete course
router.delete("/courses/:courseId/students/:studentId", removeStudentFromCourse); // Remove student

// Attendance
router.post("/courses/:courseId/attendance/start", startAttendance);

// Join Requests
router.get("/courses/:courseId/requests", getCourseJoinRequests); // View pending join requests
router.post("/courses/:courseId/approve/:studentId", approveCourseRequest);
router.post("/courses/:courseId/reject/:studentId", rejectCourseRequest);

export default router;