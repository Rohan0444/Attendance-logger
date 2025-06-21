import jwt from "jsonwebtoken";
import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid token" });
    }

    const student = await Student.findById(decoded.userId).select("-password");
    const faculty = await Faculty.findById(decoded.userId).select("-password");

    if (!student && !faculty) {
      return res.status(401).json({ message: "Unauthorized - User not found" });
    }
    if (student) {
      req.user = student;
      req.user.role = "student"; // Set role for student
    }
    if (faculty) {
      req.user = faculty;
      req.user.role = "faculty"; // Set role for faculty
    }

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};