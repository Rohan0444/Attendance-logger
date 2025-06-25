import express from 'express';
import cors from 'cors'; 
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import studentRoutes from './routes/student.route.js';
import facultyRoutes from './routes/faculty.route.js';
//import onboardRoutes from './routes/onboard.route.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Simulate __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from 2 levels up (adjust as needed)
dotenv.config({ path: path.resolve(__dirname, '../.env') });
//console.log("working directory:", process.cwd());
const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow frontend to send cookies
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' })); 
app.use(cookieParser());

//app.use("/api/onboard", onboardRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});