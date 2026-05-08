const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const {
    getProjects, createProject, getProject,
    updateProject, deleteProject, addMember
} = require("../controllers/projectController");

router.get("/", protect, getProjects);
router.post("/", protect, adminOnly, createProject);
router.get("/:id", protect, getProject);
router.put("/:id", protect, adminOnly, updateProject);
router.delete("/:id", protect, adminOnly, deleteProject);
router.post("/:id/members", protect, adminOnly, addMember);

module.exports = router;