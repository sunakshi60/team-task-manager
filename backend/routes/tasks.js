const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const { getTasks, getDashboard, createTask, updateTask, deleteTask } = require("../controllers/taskController");

router.get("/dashboard", protect, getDashboard);
router.get("/", protect, getTasks);
router.post("/", protect, adminOnly, createTask);
router.put("/:id", protect, updateTask);
router.delete("/:id", protect, adminOnly, deleteTask);

module.exports = router;