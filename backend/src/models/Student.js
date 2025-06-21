import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    department: {
        type: String,
        enum: ["CSE", "ECE", "EEE", "CE", "BT", "ME", "MME"],
    },
    semester: {
        type: String,
        enum: ["1", "2", "3", "4", "5", "6", "7", "8","9", "10"],      
    },
    rollno: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    profilePhotoUrl: {
        type: [String],
        default: "",
    },
    faceEncoding: {
        type: [Number],
        default: [],
    },
    registeredCourses: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
    attendanceRecords: [{
        course: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Course",
            required: true,
        },
        date: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["Present", "Absent"],
            required: true,
        },
    }]
}, {
    timestamps: true,
});

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

studentSchema.methods.matchPassword = async function (enteredPassword) {
  const isPasswordCorrect = await bcrypt.compare(enteredPassword, this.password);
  return isPasswordCorrect;
};

const Student = mongoose.model("Student", studentSchema);

export default Student;