import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";

// routes
import userRouter from "./route/User.js";
import cronRouter from "./route/cron.js";
import uploadRouter from "./route/Upload.js";
import donorRouter from "./route/Donor.js";
import requestRouter from "./route/Request.js";
import blogRouter from "./route/Blog.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const v = process.env.API_VERSION || "v1";

app.use(cors());
app.use(express.json());
// app.set("trust proxy", true);

// connect to MongoDB
connectDB();

// Define your routes here
app.get("/", (req, res) => {
  res.send("Welcome to the RedPulse server!");
});

// API routes
app.use(`/api/${v}/user`, userRouter);
app.use(`/api/${v}/donor`, donorRouter);
app.use(`/api/${v}/upload`, uploadRouter);
app.use(`/api/${v}/request`, requestRouter);
app.use(`/api/${v}/blog`, blogRouter);
app.use("/api/cron", cronRouter);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
