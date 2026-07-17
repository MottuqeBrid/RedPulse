import express from "express";

const router = express.Router();

// Define your user-related routes here
router.post("/register", (req, res) => {
  try {
    const { name, email, password } = req.body;
  } catch (error) {
    return res.status(500).json({ message: "Server error", success: false });
  }
});
export default router;
