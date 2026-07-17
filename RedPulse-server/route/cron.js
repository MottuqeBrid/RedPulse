// routes/cron.js
import express from "express";
import User from "../models/User.js";

const router = express.Router();

const FOUR_MONTHS_MS = 4 * 30 * 24 * 60 * 60 * 1000; // ~120 days
const MIN_AGE = 18;
const MAX_AGE = 60;
const MIN_WEIGHT = 50;

router.get("/update-availability", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const cutoff = new Date(Date.now() - FOUR_MONTHS_MS);
  const maxDob = new Date();
  maxDob.setFullYear(maxDob.getFullYear() - MIN_AGE); // born before this = 18+

  const minDob = new Date();
  minDob.setFullYear(minDob.getFullYear() - MAX_AGE); // born after this = <=60

  // set true: eligible
  const eligible = await User.updateMany(
    {
      isWillingToDonate: true,
      weight: { $gte: MIN_WEIGHT },
      dateOfBirth: { $gte: minDob, $lte: maxDob },
      $or: [{ lastDonationDate: { $lte: cutoff } }, { lastDonationDate: null }],
      isBlocked: false,
      isDeleted: false,
      isAvailable: false,
    },
    { $set: { isAvailable: true } },
  );

  // set false: no longer eligible (unwilling, underage, overage, underweight, recent donor)
  const notEligible = await User.updateMany(
    {
      isAvailable: true,
      $or: [
        { isWillingToDonate: false },
        { weight: { $lt: MIN_WEIGHT } },
        { dateOfBirth: { $gt: maxDob } }, // too young
        { dateOfBirth: { $lt: minDob } }, // too old
        { lastDonationDate: { $gt: cutoff } },
      ],
    },
    { $set: { isAvailable: false } },
  );

  res.status(200).json({
    madeAvailable: eligible.modifiedCount,
    madeUnavailable: notEligible.modifiedCount,
  });
});

export default router;
