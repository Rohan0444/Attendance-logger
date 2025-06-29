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
import Course from '../models/Course.js';

const router = express.Router();

// router.use(protectRoute, allowOnly("faculty"));

// Home / Dashboard
// router.get("/home", getFacultyHome);
router.get("/home", (req, res) => {
  // pass the dummy data to render the home page
  res.render("faculty/home.ejs", {
    // 2 dummy courses for testing
    courses: [
      { name: "Course 1", code: "CSE101", semester: "1", branch: "CSE" },
      { name: "Course 2", code: "CSE102", semester: "1", branch: "CSE" }
    ],
    role: "faculty",
    user: req.user // Assuming req.user contains faculty details
  });
});

// Profile
// router.get("/profile", getFacultyProfile);
router.get("/profile", async (req, res) => {
  // dumy data for testing
  const faculty = {
    fullName: "John Doe",
    email: "yes@gmail.com",
    facultyId: "F12345",
    department: "CSE",
    designation: "Assistant Professor",
  };

  res.render("faculty/show.ejs", {
    faculty,
    role: "faculty", // or dynamic from req.user
  });
});
router.get("/profile/edit", (req, res) => {
  // Render the edit profile page with dummy data 
  const faculty = {
    fullName: "John Doe",
    email: "yes@gmail.com",
    facultyId: "F12345",
    department: "CSE",
    designation: "Assistant Professor",
  };
  res.render("faculty/edit.ejs", {
    faculty,
    role: "faculty", // or dynamic from req.user
  })
}); // View faculty profile
router.put("/profile", updateFacultyProfile);

// Courses
router.get("/course", (req, res)=> {
  res.render("courses/create.ejs");
}); // List of courses taught by faculty
router.post("/course", createCourse);

router.get("/courses/:courseId", async (req, res) => {
  try {
    const courseId = req.params.courseId;

    const course = await Course.findById(courseId)
      .populate("pendingStudents")
      .populate("enrolledStudents")
      .populate("faculty");

    if (!course) {
      return res.status(404).render("error", { message: "Course not found" });
    }

    res.render("courses/show.ejs", {
      course,
      role: "faculty", // or dynamic from req.user
      user: req.user
    });
  } catch (err) {
    console.error("Error fetching course:", err);
    res.status(500).render("error", { message: "Internal server error" });
  }
});

// View specific course details
router.delete("/courses/:courseId", deleteCourse);                // Delete course
router.delete("/courses/:courseId/students/:studentId", removeStudentFromCourse); // Remove student

// Attendance
// router.get("/courses/:courseId/attendance/start", (req, res) => {
//   // Render attendance page for the course
//   res.render("courses/attendance.ejs", {
//     course: {
//       _id: "11",
//       name: "Sample Course",
//       code: "CSE101",
//       semester: "1",
//       branch: "CSE"
//     },
//     role: "faculty",
//     user: req.user // Assuming req.user contains faculty details
//   });
// }); // View attendance page for a course
router.get("/courses/:courseId/attendance/start", startAttendance);

// Join Requests
router.get("/courses/:courseId/requests", getCourseJoinRequests); // View pending join requests
router.post("/courses/:courseId/approve/:studentId", approveCourseRequest);
router.post("/courses/:courseId/reject/:studentId", rejectCourseRequest);

export default router;