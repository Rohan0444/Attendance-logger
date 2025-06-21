import mongoose from "mongoose";

const attendanceSessionSchema = new mongoose.Schema({
  date: {
    type: Date,
    default: Date.now
  },
  time: {
    type: String, // e.g., "10:00 AM - 11:00 AM"
    required: true,
  },
  // for each marked student, store ObjectId and timestamp
  records: [{
    student:  { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
    status:   { type: String, enum: ["Present", "Absent"], default: "Absent" }
    // (we can mark “Absent” by default or only insert “Present” and infer Absents later)
  }]
});

const courseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    code: {
        type: String,
        required: true,
        trim: true,
    },
    semester: {
        type: String,
        required: true,
        enum: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    },
    branch: {
        type: String,
        required: true,
        enum: ["CSE", "ECE", "EEE", "CE", "BT", "ME", "MME"],
    },
    faculty: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: true,
    },
    pendingStudents: [{  // Students who requested to join
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    }],
    enrolledStudents: [{  // Approved students
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student",
    }],
    attendanceSessions: [attendanceSessionSchema], // Array of attendance sessions
}, {
    timestamps: true,
});

const Course = mongoose.model("Course", courseSchema);
export default Course;