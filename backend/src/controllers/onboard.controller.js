import Student from "../models/Student.js";
import Faculty from "../models/Faculty.js";
import { upsertStreamUser } from "../lib/stream.js";
import fs from "fs";
import path from "path";
// //import {computeEncoding} from "../utils/faceHelper.js";
// import multer from "multer";

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // Save under: ./uploads/students/<studentId>/ or ./uploads/faculty/<facultyId>/
//     const userId = req.user.userId;
//     const role = req.user.role; // "student" or "faculty"
//     const folder = path.join(__dirname, "../uploads", role + "s", userId);
//     if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
//     cb(null, folder);
//   },
//   filename: function (req, file, cb) {
//     // e.g. photo1.jpg, photo2.jpg, …
//     cb(null, `${Date.now()}_${file.originalname}`);
//   }
// });

// const upload = multer({ storage });

// export async function onboardStudent(req, res) {
//     const studentId = req.user._id;

//     const {fullName, department, semester} = req.body;

//     try{
//         if( !fullName || !department || !semester) {
//             return res.status(400).json({
//                 message: "All fields are required",
//                 missingFields: [
//                     !fullName && "fullName",
//                     !department && "department",
//                     !semester && "semester",
//                 ].filter(Boolean),
//             });
//         }

//         if (!req.files || req.files.length !== 5) {
//             return res.status(400).json({ message: "Upload exactly 5 photos" });
//         }

//         const allEncodings = [];
//         for (let file of req.files) {
//             const imgPath = file.path; // e.g. "./uploads/students/<id>/159478234_photo.jpg"
//             const enc = await computeEncoding(imgPath);
//             if (!enc || enc.length === 0) {
//                 return res.status(400).json({
//                     message: `No face detected in one of the photos (${file.originalname}).`
//                 });
//             }
//             allEncodings.push(enc);
//         }

//         // 5. Average the 5 encodings → produce a single 128‐length vector
//         const averaged = allEncodings.reduce((acc, enc) => {
//             return acc.map((val, i) => val + enc[i]);
//         }, new Array(allEncodings[0].length).fill(0))
//             .map(sum => sum / allEncodings.length);
//         const updatedStudent = await Student.findByIdAndUpdate(
//             studentId,
//             {
//                 fullName,
//                 department,
//                 semester,
//                 isOnboarded: true,
//                 profilePhotoUrl: req.files.map(file => file.path), // Store paths of uploaded photos
//                 faceEncoding: averaged, // Store the averaged encoding
//             },
//             { new: true }
//         );
//         if (!updatedStudent) {
//             return res.status(404).json({message: "Student not found" });
//         }
//         try{
//             await upsertStreamUser({
//                 id: updatedStudent._id.toString(),
//                 name: updatedStudent.fullName,
//             });
//             console.log(`Stream user created for student: ${updatedStudent.fullName}`);
//         }
//         catch(error){
//             console.error("Error upserting Stream user:", error);
//         }
//         return res.status(200).json({ success: true, user: updatedStudent, role: "student" });
//     }
//     catch (error) {
//         console.error("Error during student onboarding:", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// };

// exports.onboardStudent = [
//     upload.array("photos",5),
//     async (req, res) => {
//         const studentId = req.user._id;

//         const {fullName, department, semester} = req.body;

//         try{
//             if( !fullName || !department || !semester) {
//                 return res.status(400).json({
//                     message: "All fields are required",
//                     missingFields: [
//                         !fullName && "fullName",
//                         !department && "department",
//                         !semester && "semester",
//                     ].filter(Boolean),
//                 });
//             }

//             if (!req.files || req.files.length !== 5) {
//                 return res.status(400).json({ message: "Upload exactly 5 photos" });
//             }

//             const allEncodings = [];
//             for (let file of req.files) {
//                 const imgPath = file.path; // e.g. "./uploads/students/<id>/159478234_photo.jpg"
//                 const enc = await computeEncoding(imgPath);
//                 if (!enc || enc.length === 0) {
//                 return res.status(400).json({
//                     message: `No face detected in one of the photos (${file.originalname}).`
//                 });
//                 }
//                 allEncodings.push(enc);
//             }

//             // 5. Average the 5 encodings → produce a single 128‐length vector
//             const averaged = allEncodings.reduce((acc, enc) => {
//                 return acc.map((val, i) => val + enc[i]);
//             }, new Array(allEncodings[0].length).fill(0))
//                 .map(sum => sum / allEncodings.length);


//             const updatedStudent = await Student.findByIdAndUpdate(
//                 studentId,
//                 {
//                     fullName,
//                     department,
//                     semester,
//                     isOnboarded: true,
//                     profilePhotoUrl: req.files.map(file => file.path), // Store paths of uploaded photos
//                     faceEncoding: averaged, // Store the averaged encoding
//                 },
//                 { new: true }
//             );

//             if (!updatedStudent) {
//                 return res.status(404).json({message: "Student not found" });
//             }

//             try{
//                 await upsertStreamUser({
//                     id: updatedStudent._id.toString(),
//                     name: updatedStudent.fullName,
//                 });
//                 console.log(`Stream user created for student: ${updatedStudent.fullName}`);
//             }
//             catch(error){
//                 console.error("Error upserting Stream user:", error);
//             }

//             return res.status(200).json({ success: true, user: updatedStudent, role: "student" });
//         }
//         catch (error) {
//             console.error("Error during student onboarding:", error);
//             return res.status(500).json({ success: false, message: "Internal Server Error" });
//         }
//     }
// ];

// export async function onboardFaculty(req, res) {
//     const facultyId = req.user._id;

//     const {fullName, department, designation} = req.body;

//     try{
//         if( !fullName || !department || !designation) {
//             return res.status(400).json({
//                 message: "All fields are required",
//                 missingFields: [
//                     !fullName && "fullName",
//                     !department && "department",
//                     !designation && "designation",
//                 ].filter(Boolean),
//             });
//         }

//         const updatedFaculty = await Faculty.findByIdAndUpdate(
//             facultyId,
//             {
//                 ...req.body,
//                 onboarded: true,
//             },
//             { new: true }
//         );

//         if (!updatedFaculty) {
//             return res.status(404).json({message: "Faculty not found" });
//         }

//         try{
//             await upsertStreamUser({
//                 id: updatedFaculty._id.toString(),
//                 name: updatedFaculty.fullName,
//                 image: updatedFaculty.profilePhotoUrl || "",
//             });
//             console.log(`Stream user created for faculty: ${updatedFaculty.fullName}`);
//         }
//         catch(error){
//             console.error("Error upserting Stream user:", error);
//         }

//         return res.status(200).json({ success: true, user: updatedFaculty, role: "faculty" });
//     }
//     catch (error) {
//         console.error("Error during faculty onboarding:", error);
//         return res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// }
