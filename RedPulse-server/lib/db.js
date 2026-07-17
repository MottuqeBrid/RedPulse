import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();
const connectDB = () => {
  const mongoURI =
    process.env.MONGO_URI || "mongodb://localhost:27017/redpulse";
  if (!mongoURI) {
    console.error("MONGO_URI is not defined in the environment variables");
    process.exit(1);
  }
  if (mongoose.connection.readyState === 1) {
    console.log("Already connected to MongoDB");
    return;
  }
  mongoose.connect(mongoURI);
  const db = mongoose.connection;
  db.on("error", console.error.bind(console, "MongoDB connection error:"));
  db.once("open", () => {
    console.log("Connected to MongoDB");
  });
};

export { connectDB };
