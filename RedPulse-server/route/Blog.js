import express from "express";
import userMiddleware from "../middleware/User.js";
import Blog from "../models/Blog.js";

const router = express.Router();

const UPDATABLE_FIELDS = [
  "title",
  "content",
  "images",
  "thumbnail",
  "isPublished",
];

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const ACTIVE_BLOG_FILTER = { isPublished: true, isDeleted: false };

// Search blogs by title or content (must be before /:id)
router.get("/search/:query", async (req, res) => {
  try {
    const query = escapeRegex(req.params.query);
    const regex = new RegExp(query, "i");

    const blogs = await Blog.find({
      ...ACTIVE_BLOG_FILTER,
      $or: [{ title: regex }, { content: regex }],
    })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Error searching blogs:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Get all published blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find(ACTIVE_BLOG_FILTER)
      .populate("author", "name email avatar")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Get current user's blogs (including drafts)
router.get("/my", userMiddleware, async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.user.userId, isDeleted: false })
      .populate("author", "name email avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: blogs.length,
      data: blogs,
    });
  } catch (error) {
    console.error("Error fetching user blogs:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Get a single blog by ID
router.get("/:id", async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, ...ACTIVE_BLOG_FILTER },
      { $inc: { visitor: 1 } },
      { new: true },
    ).populate("author", "name email avatar");

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Create a new blog (requires authentication)
router.post("/", userMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res
        .status(400)
        .json({ message: "Title and content are required", success: false });
    }

    const blog = new Blog({
      ...req.body,
      author: req.user.userId,
    });

    await blog.save();
    return res.status(201).json({ success: true, data: blog });
  } catch (error) {
    console.error("Error creating blog:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Update a blog (requires authentication)
router.patch("/:id", userMiddleware, async (req, res) => {
  try {
    const updates = {};
    for (const key of UPDATABLE_FIELDS) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res
        .status(400)
        .json({ message: "No valid fields to update", success: false });
    }

    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userId },
      updates,
      { new: true, runValidators: true },
    );

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    return res.status(200).json({ success: true, data: blog });
  } catch (error) {
    console.error("Error updating blog:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

// Delete a blog (requires authentication)
router.delete("/:id", userMiddleware, async (req, res) => {
  try {
    const blog = await Blog.findOneAndUpdate(
      { _id: req.params.id, author: req.user.userId },
      { isDeleted: true },
      { new: true },
    );

    if (!blog) {
      return res
        .status(404)
        .json({ message: "Blog not found", success: false });
    }

    return res.status(200).json({ success: true, message: "Blog deleted" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return res.status(500).json({ message: "Server error", success: false });
  }
});

export default router;
