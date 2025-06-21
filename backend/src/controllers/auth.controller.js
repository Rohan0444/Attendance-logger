import { upsertStreamUser } from "../lib/stream.js";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import jwt from "jsonwebtoken";

export async function login(req, res) {
    const { email, password } = req.body;

    try{
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const student = await Student.findOne({email});
        if(student){
            const isMatch = await student.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ userId: student._id, role: "student" }, process.env.JWT_SECRET_KEY, {
                expiresIn: "7d",
            });

            res.cookie("jwt", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true, // prevent XSS attacks,
                sameSite: "strict", // prevent CSRF attacks
                secure: process.env.NODE_ENV === "production",
            });

            // Upsert user in Stream
            await upsertStreamUser(student);

            return res.status(200).json({ success: true, user: student, role:"student" });
        }

        const faculty = await Faculty.findOne({email});
        if(faculty){
            const isMatch = await faculty.matchPassword(password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            const token = jwt.sign({ userId: faculty._id, role: "faculty" }, process.env.JWT_SECRET_KEY, {
                expiresIn: "7d",
            });

            res.cookie("jwt", token, {
                maxAge: 7 * 24 * 60 * 60 * 1000,
                httpOnly: true, // prevent XSS attacks,
                sameSite: "strict", // prevent CSRF attacks
                secure: process.env.NODE_ENV === "production",
            });

            // Upsert user in Stream
            await upsertStreamUser(faculty);

            return res.status(200).json({ success: true, user: faculty, role:"faculty" });
        }

        return res.status(404).json({ success: false, message: "User not found" });
    }
    catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export async function signupStudent(req, res) {
    const { fullName, email, password, rollno } = req.body;

    try {
        if (!fullName || !email || !password || !rollno) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newStudent = await Student.create({
            fullName,
            email,
            password,
            profilePhotoUrl: randomAvatar,
            rollno,
        });

        try{
            await upsertStreamUser({
                id: newStudent._id.toString(),
                name: newStudent.fullName,
                image: newStudent.profilePhotoUrl || "",
                rollno: newStudent.rollno,
            });
            console.log(`Stream user created for student: ${newStudent.fullName}`);
        }
        catch(error) {
            console.error("Error upserting Stream user:", error);
        }

        const token = jwt.sign({ userId: newStudent._id, role: "student" }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d",
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // prevent XSS attacks,
            sameSite: "strict", // prevent CSRF attacks
            secure: process.env.NODE_ENV === "production",
        });

        res.status(201).json({success: true, user: newStudent, role: "student" });
    }
    catch (error) {
        console.error("Error during student signup:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export async function signupFaculty(req, res) {
    const { fullName, email, password, facultyId } = req.body;

    try {
        if (!fullName || !email || !password || !facultyId) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        const existingFaculty = await Faculty.findOne({ email });
        if (existingFaculty) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
        const randomAvatar = `https://avatar.iran.liara.run/public/${idx}.png`;

        const newFaculty = await Faculty.create({
            fullName,
            email,
            password,
            facultyId,
            profilePhotoUrl: randomAvatar,
        });

        try{
            await upsertStreamUser({
                id: newFaculty._id.toString(),
                name: newFaculty.fullName,
                image: newFaculty.profilePhotoUrl || "",
                facultyId: newFaculty.facultyId,
            });
            console.log(`Stream user created for faculty: ${newFaculty.fullName}`);
        }
        catch(error) {
            console.error("Error upserting Stream user:", error);
        }

        const token = jwt.sign({ userId: newFaculty._id, role: "faculty" }, process.env.JWT_SECRET_KEY, {
            expiresIn: "7d",
        });

        res.cookie("jwt", token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true, // prevent XSS attacks,
            sameSite: "strict", // prevent CSRF attacks
            secure: process.env.NODE_ENV === "production",
        });

        res.status(201).json({success: true, user: newFaculty, role: "faculty" });
    }
    catch (error) {
        console.error("Error during faculty signup:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}
