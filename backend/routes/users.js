const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const User = require("../models/User");

router.get("/", protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;