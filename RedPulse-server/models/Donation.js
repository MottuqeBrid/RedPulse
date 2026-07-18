import mongoose from "mongoose";

const donationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
      required: true,
    },
    location: {
      type: {
        type: String,
      },
    },
    images: [
      {
        type: String,
      },
    ],
    description: {
      type: String,
    },
  },
  { timestamps: true },
);

const Donation = mongoose.model("Donation", donationSchema);

export default Donation;
