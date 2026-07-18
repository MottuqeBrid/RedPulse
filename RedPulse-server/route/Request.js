import express from "express";
import userMiddleware from "../middleware/User.js";
import User from "../models/User.js";
import Request from "../models/Request.js";

const router = express.Router();

// Get all blood requests sent by the authenticated user
router.get("/send", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -devices -location",
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const requests = await Request.find({
      sender: req.user.userId,
      isDeleted: false,
    })
      .populate("receiver", "name email phone bloodGroup gender")
      .sort({
        createdAt: -1,
      });
    if (!requests || requests.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests found", success: false });
    }
    return res.status(200).json({
      message: "Requests retrieved successfully",
      success: true,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Get all blood requests received by the other authenticated user
router.get("/receive", userMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "-password -devices -location",
    );
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", success: false });
    }
    const requests = await Request.find({
      receiver: req.user.userId,
      isDeleted: false,
    })
      .populate("sender", "name email phone bloodGroup gender")
      .sort({
        createdAt: -1,
      });
    if (!requests || requests.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests found", success: false });
    }
    return res.status(200).json({
      message: "Requests retrieved successfully",
      success: true,
      data: requests,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Mark a blood request as read
router.patch("/:id/read", userMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await Request.findOne({
      _id: requestId,
      receiver: req.user.userId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found", success: false });
    }

    request.isRead = true;
    await request.save();

    return res.status(200).json({
      message: "Request marked as read",
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Delete a blood request sender can delete the request
router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await Request.findOne({
      _id: requestId,
      receiver: req.user.userId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found", success: false });
    }
    request.isDeleted = true;
    await request.save();
    return res.status(200).json({
      message: "Request deleted successfully",
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Update the status of a blood request (accept or reject) by the receiver
router.patch("/:id/status", userMiddleware, async (req, res) => {
  try {
    const requestId = req.params.id;
    const { status } = req.body;
    const request = await Request.findOne({
      _id: requestId,
      receiver: req.user.userId,
    });
    if (!request) {
      return res
        .status(404)
        .json({ message: "Request not found", success: false });
    }
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'accepted' or 'rejected'",
        success: false,
      });
    }
    request.status = status;
    await request.save();
    return res.status(200).json({
      message: "Request status updated successfully",
      success: true,
      data: request,
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});

export default router;
