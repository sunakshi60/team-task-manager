const Project = require("../models/Project");
const User = require("../models/User");

const getProjects = async (req, res) => {
    try {
        const projects = await Project.find({}).populate("owner", "name email").populate("members", "name email");
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createProject = async (req, res) => {
    try {
        const { name, description } = req.body;
        if (!name) return res.status(400).json({ message: "Project name required" });

        const project = await Project.create({
            name,
            description,
            owner: req.user._id,
            members: [req.user._id],
        });
        res.status(201).json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate("owner", "name email")
            .populate("members", "name email");
        if (!project) return res.status(404).json({ message: "Project not found" });
        res.json(project);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.owner.toString() !== req.user._id.toString() && req.user.role !== "admin")
            return res.status(403).json({ message: "Not authorized" });

        const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.owner.toString() !== req.user._id.toString() && req.user.role !== "admin")
            return res.status(403).json({ message: "Not authorized" });

        await project.deleteOne();
        res.json({ message: "Project deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const addMember = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User not found" });

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json({ message: "Project not found" });

        if (project.members.includes(user._id))
            return res.status(400).json({ message: "User already in project" });

        project.members.push(user._id);
        await project.save();
        res.json({ message: "Member added", project });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMember };