import Student from '../models/Student.js';
import Course from '../models/Course.js';
import { getEmbedding } from './auth.controller.js';
export async function getStudentDetails(req, res) {
    try {
        // you have to return two things: courses in which user is registered and the courses in which user is valid(same sem, branch but not registered)
        const studentId = req.user._id;
        const student = await Student.findById(studentId)
            .populate('registeredCourses', 'name code semester branch faculty')

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        
        const courses = await Course.find({
            semester: student.semester,
            branch: student.branch,
            _id: { $ne: student.registeredCourses._id } // Exclude already registered course
        }).populate('faculty', 'name email designation');

        res.status(200).json({
            student: {
                fullName: student.fullName,
                email: student.email,
                profilePhotoUrl: student.profilePhotoUrl,
                registeredCourses: student.registeredCourses,
                isOnboarded: student.isOnboarded
            },
            availableCourses: courses
        });

    } catch (error) {
        console.error('Error fetching student details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getStudentProfile(req, res) {
    try {
        const student = await Student.findById(req.user._id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json(student);
    } catch (error) {
        console.error('Error fetching student profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function updateStudentProfile(req, res) {
    try {
        const { fullName, semester, profilePhotoUrl } = req.body;
        if (!fullName || !semester) {
            return res.status(400).json({ message: 'Full name and semester are required' });
        }
        const face_encoding = await getEmbedding(profilePhotoUrl);
        const updatedStudent = await Student.findByIdAndUpdate(
            req.user._id,
            { fullName, semester, profilePhotoUrl, faceEncoding: face_encoding },
            { new: true }
        );

        if (!updatedStudent) {
            return res.status(404).json({ message: 'Student not found' });
        }

        res.status(200).json({ user: updatedStudent, role: 'student' });
    } catch (error) {
        console.error('Error updating student profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function enrollInCourse(req, res) {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        if (course.enrolledStudents.includes(studentId)) {
            return res.status(400).json({ message: 'Already enrolled in this course' });
        }

        // Check if the course is in the same semester and branch as the student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        if (course.semester !== student.semester || course.branch !== student.branch) {
            return res.status(400).json({ message: 'Cannot enroll in course from different semester or branch' });
        }

        course.pendingStudents.push(studentId);
        await course.save();
        
        res.status(200).json({ message: 'Successfully apply in the course' });
    } catch (error) {
        console.error('Error enrolling in course:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAttendanceRecords(req, res) {
    try {
        const courseId = req.params.courseId;
        const studentId = req.user._id;


        const course = await Course.findById(courseId).populate('attendanceSessions.records.student', 'fullName');
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        const attendanceRecords = course.attendanceSessions.map(session => {
            const record = session.records.find(r => r.student._id.toString() === studentId.toString());
            return {
                date: session.date,
                time: session.time,
                status: record ? record.status : 'Absent'
            };
        });

        res.status(200).json(attendanceRecords);
    } catch (error) {
        console.error('Error fetching attendance records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getAllAttendanceRecords(req, res) {
    try {
        const studentId = req.user._id;

        // Get the student and populate attendance records with course info
        const student = await Student.findById(studentId)
            .populate('attendanceRecords.course', 'name code semester branch faculty');

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Group attendance records by course
        const groupedRecords = {};

        student.attendanceRecords.forEach((record) => {
            const courseId = record.course._id.toString();
            
            if (!groupedRecords[courseId]) {
                groupedRecords[courseId] = {
                    course: record.course,
                    records: []
                };
            }

            groupedRecords[courseId].records.push({
                date: record.date,
                status: record.status
            });
        });

        res.status(200).json(groupedRecords);

    } catch (error) {
        console.error('Error fetching all attendance records:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
