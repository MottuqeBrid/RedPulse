// routes/cron.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

router.get("/update-availability", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const NINETY_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(Date.now() - NINETY_DAYS_MS);

  const result = await User.updateMany(
    { lastDonationDate: { $lte: cutoff }, isAvailable: false },
    { $set: { isAvailable: true } },
  );

  res.status(200).json({ updated: result.modifiedCount });
});

export default router;
