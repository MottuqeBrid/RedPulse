import express from "express";
import User from "../models/User.js";
import { checkEligible } from "../lib/checkEligble.js";
import userMiddleware from "../middleware/User.js";
import Request from "../models/Request.js";

const router = express.Router();

const calcAge = (dob) => {
  if (!dob) return null;
  const ms = Date.now() - new Date(dob).getTime();
  return ms >= 0 ? Math.floor(ms / (1000 * 60 * 60 * 24 * 365.25)) : null;
};

// Search for available donors by blood group and optional location
router.get("/search", async (req, res) => {
  try {
    const {
      bloodGroup,
      division,
      district,
      upazila,
      page = 1,
      limit = 20,
    } = req.query;

    if (!bloodGroup) {
      return res
        .status(400)
        .json({ message: "bloodGroup is required", success: false });
    }

    const query = {
      bloodGroup,
      isAvailable: true,
      isWillingToDonate: true,
      isBlocked: false,
      isDeleted: false,
    };

    if (division) query["address.division"] = division;
    if (district) query["address.district"] = district;
    if (upazila) query["address.upazila"] = upazila;

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -devices -location")
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    const selected = users.filter(checkEligible);

    return res.status(200).json({
      success: true,
      count: selected.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: selected,
    });
  } catch (error) {
    console.error("Error in donor search:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Get all eligible donors
router.get("/all", async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const query = { role: "donor", isBlocked: false, isDeleted: false };

    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password -devices -location")
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      User.countDocuments(query),
    ]);

    const selected = users.filter(checkEligible);

    return res.status(200).json({
      success: true,
      count: selected.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      data: selected,
    });
  } catch (error) {
    console.error("Error fetching all donors:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Get donor by ID
router.get("/:id", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password -devices -location")
      .lean();

    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }

    return res.status(200).json({
      success: true,
      data: {
        ...user,
        age: calcAge(user.dateOfBirth),
        isEligible: checkEligible(user),
      },
    });
  } catch (error) {
    console.error("Error fetching donor by ID:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.post("/request", userMiddleware, async (req, res) => {
  try {
    const { donorId, message } = req.body;
    const senderId = req.user.userId;

    if (!donorId || !message?.trim()) {
      return res
        .status(400)
        .json({ message: "donorId and message are required", success: false });
    }

    if (senderId.toString() === donorId.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot send request to yourself", success: false });
    }

    const donor = await User.findById(donorId);
    if (!donor) {
      return res
        .status(404)
        .json({ message: "Donor not found", success: false });
    }
    const isEligible = checkEligible(donor);
    if (!isEligible) {
      return res.status(400).json({
        message: "Donor is not eligible to receive requests",
        success: false,
      });
    }

    // Create a new request
    const newRequest = new Request({
      sender: senderId,
      receiver: donorId,
      message,
    });

    await newRequest.save();

    await User.findByIdAndUpdate(senderId, {
      $push: { requests: newRequest._id },
    });

    await User.findByIdAndUpdate(donorId, {
      $push: { requests: newRequest._id },
    });

    return res.status(201).json({
      message: "Request sent successfully",
      success: true,
      data: newRequest,
    });
  } catch (error) {
    console.error("Error sending request:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

export default router;
