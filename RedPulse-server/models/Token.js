import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    token: { type: String, required: true },
    device: { type: Object }, // Store device information
    expiresAt: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }, // Default expiration: 30 days
  },
  { timestamps: true },
);

const Token = mongoose.model("Token", tokenSchema);
export default Token;
