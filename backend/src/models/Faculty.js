import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const facultySchema = new mongoose.Schema({
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
    facultyId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    department: {
        type: String,
        enum: ["CSE", "ECE", "EEE", "CE", "BT", "ME", "MME"],
    },
    designation: {
        type: String,
        enum: ["Professor", "Associate Professor", "Assistant Professor"],
    },
    coursesTaught: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
    }],
    profilePhotoUrl: {
        type: String,
        default: "",
    },
    isOnboarded: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

facultySchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

const Faculty = mongoose.model("Faculty", facultySchema);
export default Faculty;