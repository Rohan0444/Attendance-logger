import Faculty from "../models/Faculty.js";
import Course from "../models/Course.js";
import Student from "../models/Student.js";

export async function getFacultyHome(req, res) {
    // fetch faculty courses
    try {
        const faculty = await Faculty.findById(req.user._id).populate("coursesTaught");
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.status(200).json({ courses: faculty.coursesTaught, role: "faculty" });
    } catch (error) {
        console.error("Error fetching faculty home:", error);
        res.status(500).json({ message: "Internal server error" });
    }   
};

export async function getFacultyProfile(req, res) {
    try {
        const faculty = await Faculty.findById(req.user._id);
        if (!faculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.status(200).json(faculty);
    } catch (error) {
        console.error("Error fetching faculty profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function updateFacultyProfile(req, res) {
    try {
        const { department, designation } = req.body;
        if (!department || !designation) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const updatedFaculty = await Faculty.findByIdAndUpdate(
            req.user._id,
            {
                ...req.body, // Spread operator to update all fields
                department: department,
                designation: designation,
            },
            { new: true }
        );

        if (!updatedFaculty) {
            return res.status(404).json({ message: "Faculty not found" });
        }

        res.status(200).json({user: updatedFaculty, role: "faculty"});
    } catch (error) {
        console.error("Error updating faculty profile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function createCourse(req, res) {
    try {
        const { name, code, semester, branch } = req.body;
        if (!name || !code || !semester || !branch) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCourse = new Course({
            name,
            code,
            semester,
            branch,
            faculty: req.user._id,
        });

        await newCourse.save(); // Save the course to the database
        await Faculty.findByIdAndUpdate(req.user._id, { $push: { coursesTaught: newCourse._id } });

        res.status(201).json({course: newCourse});
    } catch (error) {
        console.error("Error creating course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function deleteCourse(req, res) {
    try {
        const courseId = req.params.id;
        const course = await Course.findById(courseId);

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Remove the course from the faculty's coursesTaught
        await Faculty.findByIdAndUpdate(req.user._id, { $pull: { coursesTaught: courseId } });

        // Delete the course
        await Course.findByIdAndDelete(courseId);

        res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeStudentFromCourse(req, res) {
    try {
        const { courseId, studentId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the student exists in the database
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Check if the student is enrolled in the course
        if (!course.enrolledStudents.includes(studentId)) {
            return res.status(404).json({ message: "Student not enrolled in this course" });
        }

        // Remove student from enrolledStudents
        course.enrolledStudents.pull(studentId);
        await course.save();

        res.status(200).json({ message: "Student removed from course successfully" });
    } catch (error) {
        console.error("Error removing student from course:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function startAttendance(req, res) {
     
}

export async function getCourseJoinRequests(req, res) {
    try {
        const courseId = req.params.courseId;
        const course = await Course.findById(courseId).populate("pendingStudents");

        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        res.status(200).json({ requests: course.pendingStudents });
    } catch (error) {
        console.error("Error fetching course join requests:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function approveCourseRequest(req, res) {
    try {
        const { courseId, studentId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the student is in the pending list
        if (!course.pendingStudents.includes(studentId)) {
            return res.status(404).json({ message: "Student not found in pending requests" });
        }

        // Check if the student is already enrolled
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found", user: student });
        }

        // Remove from pending and add to enrolled
        course.pendingStudents.pull(studentId);
        course.enrolledStudents.push(studentId);
        await course.save();

        res.status(200).json({ message: "Student approved for course" });
    } catch (error) {
        console.error("Error approving course request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export async function rejectCourseRequest(req, res) {
    try {
        const { courseId, studentId } = req.params;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        // Check if the student is in the pending list
        if (!course.pendingStudents.includes(studentId)) {
            return res.status(404).json({ message: "Student not found in pending requests" });
        }

        // Check if the student exists
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found", user: student });
        }
        // Remove from pending
        course.pendingStudents.pull(studentId);
        await course.save();

        res.status(200).json({ message: "Student rejected from course", user: student });
    }
    catch (error) {
        console.error("Error rejecting course request:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};