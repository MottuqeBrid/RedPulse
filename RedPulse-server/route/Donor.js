import express from "express";
import User from "../models/User.js";
import Message from "../models/Message.js";
import { checkEligible } from "../lib/checkEligble.js";
import userMiddleware from "../middleware/User.js";

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

// Send message to donor
// router.post("/message", userMiddleware, async (req, res) => {
//   try {
//     const { receiver, content } = req.body;
//     const sender = req.user.userId;

//     if (!receiver || !content?.trim()) {
//       return res
//         .status(400)
//         .json({ message: "receiver and content are required", success: false });
//     }

//     if (sender === receiver) {
//       return res
//         .status(400)
//         .json({ message: "Cannot message yourself", success: false });
//     }

//     const recipient = await User.findById(receiver);
//     if (!recipient || recipient.isDeleted) {
//       return res
//         .status(404)
//         .json({ message: "Receiver not found", success: false });
//     }

//     const message = await Message.create({
//       sender,
//       receiver,
//       content: content.trim(),
//     });

//     await User.updateMany(
//       { _id: { $in: [sender, receiver] } },
//       { $push: { messages: message._id } },
//     );

//     return res.status(201).json({
//       message: "Message sent successfully",
//       success: true,
//       data: message,
//     });
//   } catch (error) {
//     console.error("Error sending message:", error);
//     return res.status(500).json({ message: "Server error", success: false });
//   }
// });

// routes/message.js
router.post("/message", userMiddleware, async (req, res) => {
  try {
    const { receiver, content } = req.body;
    const sender = req.user.userId;

    if (!receiver || !content?.trim()) {
      return res
        .status(400)
        .json({ message: "receiver and content are required", success: false });
    }

    if (sender.toString() === receiver.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot message yourself", success: false });
    }

    const recipient = await User.findById(receiver).select(
      "_id isDeleted isBlocked",
    );
    if (!recipient || recipient.isDeleted || recipient.isBlocked) {
      return res
        .status(404)
        .json({ message: "Receiver not found", success: false });
    }

    const message = await Message.create({
      sender,
      receiver,
      content: content.trim(),
    });

    await User.findByIdAndUpdate(
      sender,
      { $push: { messages: message._id } },
      { new: true },
    );
    await User.findByIdAndUpdate(
      receiver,
      { $push: { messages: message._id } },
      { new: true },
    );

    return res.status(201).json({
      message: "Message sent successfully",
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

export default router;
