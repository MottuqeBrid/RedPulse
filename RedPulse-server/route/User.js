import express from "express";
import { hashPassword, comparePassword } from "../lib/password.js";
import { generateToken } from "../lib/jwt.js";
import userMiddleware from "../middleware/User.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { deviceInfo } from "../lib/devie.js";
import { checkEligible } from "../lib/checkEligble.js";
import Donation from "../models/Donation.js";

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
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Email already in use", success: false });
    }
    if (existingUser?.isDeleted) {
      return res.status(400).json({
        message: "User account is deleted use another email for registration",
        success: false,
      });
    }
    const hashpass = await hashPassword(password);
    const newUser = new User({ ...req.body, password: hashpass });

    const token = await generateToken({
      userId: newUser._id,
      role: newUser.role,
    }); // Assuming you have a function to generate JWT tokens
    const device = await deviceInfo(req);
    const tokenDocument = await Token.create({
      userId: newUser._id,
      token,
      device,
    });
    const isEligible = checkEligible(newUser);
    newUser.isAvailable = isEligible;
    await newUser.save();
    newUser.devices.push(tokenDocument._id);
    await newUser.save();
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Set to true in production
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    return res
      .status(201)
      .json({ message: "User created successfully", success: true, token });
  } catch (error) {
    console.error("Error in /register route:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Login route
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
    if (user.isDeleted) {
      return res
        .status(403)
        .json({ message: "User account is deleted", success: false });
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

// Get current user route
router.get("/me", userMiddleware, async (req, res) => {
  try {
    const token = req.token;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized", success: false });
    }
    const user = await User.findById(req.user.userId).select("-password");
    if (!user || user.isDeleted) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const isEligible = checkEligible(user);
    user.isAvailable = isEligible;
    await user.save();
    const tokenExists = await Token.findOne({ userId: user._id, token });
    if (!tokenExists) {
      return res.status(401).json({ message: "Invalid token", success: false });
    }
    return res.json({ message: "User found", success: true, data: user });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Logout route
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

router.patch("/update", userMiddleware, async (req, res) => {
  try {
    const { password, email, phone, ...updateData } = req.body;
    const userId = req.user.userId;
    const { fields } = await req.query;

    const existingUser = await User.findById(userId).select("+password");
    if (!existingUser || existingUser.isDeleted) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    if (fields == "password" && password) {
      const hashedPassword = await hashPassword(password);
      updateData.password = hashedPassword;
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");
      if (!user) {
        return res
          .status(404)
          .json({ message: "User not found", success: false });
      }
      return res.status(200).json({
        message: "Password updated successfully",
        success: true,
        data: user,
      });
    }
    if (fields == "email" && email) {
      const existingEmailUser = await User.findOne({ email });
      if (existingEmailUser) {
        return res
          .status(400)
          .json({ message: "Email already in use", success: false });
      }
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");
      return res.status(200).json({
        message: "Email updated successfully",
        success: true,
        data: user,
      });
    }

    if (fields == "phone" && phone) {
      const existingPhoneUser = await User.findOne({ phone: updateData.phone });
      if (existingPhoneUser) {
        return res
          .status(400)
          .json({ message: "Phone number already in use", success: false });
      }
      const user = await User.findByIdAndUpdate(userId, updateData, {
        new: true,
      }).select("-password");
      return res.status(200).json({
        message: "Phone number updated successfully",
        success: true,
        data: user,
      });
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const isEligible = checkEligible(user);
    user.isAvailable = isEligible;
    await user.save();

    return res.json({
      message: "User updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.delete("/delete", userMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true },
    ).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    return res.json({
      message: "User deleted successfully",
      success: true,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.patch("/update/donation", userMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { lastDonationDate } = req.body;
    if (!lastDonationDate) {
      return res
        .status(400)
        .json({ message: "lastDonationDate is required", success: false });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const eligible = checkEligible(user);
    if (!eligible) {
      return res.status(400).json({
        message: "User is not eligible to update donation date",
        success: false,
      });
    }
    const donation = new Donation({
      user: userId,
      date: lastDonationDate,
      images: req.body.images || [],
      description: req.body.description || "",
    });
    await donation.save();
    user.donations.push(donation._id);
    user.lastDonationDate = lastDonationDate;
    user.totalDonations += 1;
    await user.save();
    return res.status(200).json({
      message: "Donation date updated successfully",
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error updating donation date:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.get("/donations", userMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const donations = await Donation.find({ user: userId }).sort({
      date: -1,
    });
    return res.status(200).json({
      message: "Donations retrieved successfully",
      success: true,
      data: donations,
    });
  } catch (error) {
    console.error("Error retrieving donations:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.patch("/donations/:id", userMiddleware, async (req, res) => {
  try {
    const userId = req.user.userId;
    const donationId = req.params.id;
    const { date, images, description } = req.body;

    // Fetch user (excluding password)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    // Fetch donation belonging to user
    const donation = await Donation.findOne({ _id: donationId, user: userId });
    if (!donation) {
      return res
        .status(404)
        .json({ message: "Donation not found", success: false });
    }

    // Check eligibility with proposed date (falls back to existing date)
    const newDate = date || donation.date;
    const eligible = checkEligible({ ...user, lastDonationDate: newDate });

    // Update user availability and last donation date
    user.isAvailable = eligible;
    user.lastDonationDate = newDate;
    await user.save();

    // Update donation fields
    if (date) donation.date = date;
    if (images) donation.images = images;
    if (description) donation.description = description;
    await donation.save();

    return res.status(200).json({
      message: "Donation updated successfully",
      success: true,
      data: donation,
    });
  } catch (error) {
    console.error("Error updating donation:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

export default router;
