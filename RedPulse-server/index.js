import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// routes
import userRouter from "./route/User.js";
import cronRouter from "./route/cron.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const v = process.env.API_VERSION || "v1";

app.use(cors());
app.use(express.json());

// Define your routes here
app.get("/", (req, res) => {
  res.send("Welcome to the RedPulse server!");
});

app.use(`api/${v}/user`, userRouter);
app.use("/api/cron", cronRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
