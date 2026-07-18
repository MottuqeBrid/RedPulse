import express from "express";
import userMiddleware from "../middleware/User.js";
import User from "../models/User.js";
import Message from "../models/Message.js";

const router = express.Router();

router.get("/", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -devices -location",
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const message = await Message.find({
      receiver: req.user.userId,
      isDeleted: false,
    }).sort({
      createdAt: -1,
    });
    if (!message || message.length === 0) {
      return res
        .status(404)
        .json({ message: "No messages found", success: false });
    }
    return res.status(200).json({
      message: "Messages retrieved successfully",
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.patch("/:id/read", userMiddleware, async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: req.user.userId },
      { isRead: true },
      { new: true },
    );
    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found", success: false });
    }

    return res.status(200).json({
      message: "Message marked as read",
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    const messageId = req.params.id;
    const message = await Message.findOneAndUpdate(
      { _id: messageId, receiver: req.user.userId },
      { isDeleted: true },
      { new: true },
    );
    if (!message) {
      return res
        .status(404)
        .json({ message: "Message not found", success: false });
    }
    return res.status(200).json({
      message: "Message deleted successfully",
      success: true,
      data: message,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

export default router;
