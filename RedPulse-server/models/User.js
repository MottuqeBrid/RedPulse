// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, required: true, unique: true },

    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
      required: true,
    },
    gender: { type: String, enum: ["male", "female", "other"] },
    weight: { type: Number, min: 0 },
    dateOfBirth: { type: Date },
    bio: { type: String, trim: true },
    blogs: [{ type: mongoose.Schema.Types.ObjectId, ref: "Blog" }],
    photos: [{ type: mongoose.Schema.Types.ObjectId, ref: "Photo" }],

    address: {
      division: String,
      district: String,
      upazila: String,
      details: String,
    },

    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] }, // [lng, lat]
    },

    role: {
      type: String,
      enum: ["donor", "admin", "volunteer", "organization", "moderator"],
      default: "donor",
    },

    isAvailable: { type: Boolean, default: true }, // donor ready or not
    isWillingToDonate: { type: Boolean, default: true }, // donor willing to donate or not
    lastDonationDate: { type: Date },
    totalDonations: { type: Number, default: 0 },

    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },

    avatar: { type: String },

    devices: [
      {
        deviceId: String,
        lastLogin: Date,
        data: {
          type: Object,
        },
      },
    ],
  },
  { timestamps: true },
);

userSchema.index({ location: "2dsphere" }); // near-me search
userSchema.index({ bloodGroup: 1, isAvailable: 1 }); // fast donor search

export default mongoose.model("User", userSchema);
