import express from "express";
import multer from "multer";
import { uploadImageToImgbb } from "../lib/imgbb.js";
import userMiddleware from "../middleware/User.js";
import User from "../models/User.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

router.post("/", userMiddleware, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "No file uploaded", success: false });
    }

    const result = await uploadImageToImgbb(req.file);
    await User.findByIdAndUpdate(
      req.user.userId,
      { $push: { uploads: { ...result, date: new Date() } } },
      { new: true },
    );
    return res.status(200).json({
      message: "Image uploaded successfully",
      success: true,
      data: {
        url: result.url,
        displayUrl: result.displayUrl,
        deleteUrl: result.deleteUrl,
        filename: result.filename,
        originalName: result.originalName,
        mimeType: result.mimeType,
        size: result.size,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
});

export default router;
