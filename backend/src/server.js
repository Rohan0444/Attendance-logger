import express from 'express';
import cors from 'cors'; 
import "dotenv/config";
import cookieParser from 'cookie-parser';
import { connectDB } from './lib/db.js';
import authRoutes from './routes/auth.route.js';
import studentRoutes from './routes/student.route.js';
import facultyRoutes from './routes/faculty.route.js';
import onboardRoutes from './routes/onboard.route.js';

const app = express();
const PORT = process.env.PORT;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // allow frontend to send cookies
  })
);

app.use(express.json()); 
app.use(cookieParser());

app.use("/api/onboard", onboardRoutes)
app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/faculty", facultyRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});