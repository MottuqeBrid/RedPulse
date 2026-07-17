import express from "express";
import { hashPassword, comparePassword } from "../lib/password.js";
import { generateToken } from "../lib/jwt.js";
import userMiddleware from "../middleware/User.js";
import Token from "../models/Token.js";

const router = express.Router();

// Define your user-related routes here
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, bloodGroup, phone, weight } = req.body;

    if (!name || !email || !password || !bloodGroup || !phone || !weight) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const hashpass = await hashPassword(password);
    const newUser = new User({ password: hashpass, ...req.body });
    await newUser.save();
    const token = await generateToken({
      userId: newUser._id,
      role: newUser.role,
    }); // Assuming you have a function to generate JWT tokens
    const device = await deviceInfo(req);
    await Token.create({
      userId: newUser._id,
      token,
      device,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return res
      .status(201)
      .json({ message: "User created successfully", success: true, token });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required", success: false });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Invalid email or password", success: false });
    }

    const token = await generateToken({ userId: user._id, role: user.role });
    const device = await deviceInfo(req);
    await Token.create({
      userId: user._id,
      token,
      device,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    return res.json({ message: "Login successful", success: true, token });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.get("/me", userMiddleware, async (req, res) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const tokenExists = await Token.findOne({ userId: user._id, token });
    if (!tokenExists) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }
    return res.json({ message: "User found", success: true, user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.post("/logout", userMiddleware, async (req, res) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    await Token.findOneAndDelete({ userId: req.user.userId, token });
    res.clearCookie("token");
    return res.json({ message: "Logout successful", success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

export default router;
