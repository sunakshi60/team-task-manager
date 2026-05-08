const Task = require("../models/Task");
const Project = require("../models/Project");

const getTasks = async (req, res) => {
    try {
        const { projectId } = req.query;
        const filter = projectId ? { project: projectId } : {};
        const tasks = await Task.find(filter)
            .populate("assignedTo", "name email")
            .populate("createdBy", "name email")
            .populate("project", "name");
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getDashboard = async (req, res) => {
    try {
        const now = new Date();
        let filter = {};
        if (req.user.role !== "admin") {
            filter = { assignedTo: req.user._id };
        }
        const allTasks = await Task.find(filter).populate("project", "name");

        const summary = {
            total: allTasks.length,
            todo: allTasks.filter(t => t.status === "todo").length,
            inProgress: allTasks.filter(t => t.status === "in-progress").length,
            done: allTasks.filter(t => t.status === "done").length,
            overdue: allTasks.filter(t => t.dueDate && new Date(t.dueDate) < now && t.status !== "done").length,
            tasks: allTasks,
        };
        res.json(summary);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const createTask = async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, projectId, assignedTo } = req.body;
        if (!title || !projectId)
            return res.status(400).json({ message: "Title and projectId required" });

        const project = await Project.findById(projectId);
        if (!project) return res.status(404).json({ message: "Project not found" });

        const task = await Task.create({
            title, description, status, priority, dueDate,
            project: projectId,
            assignedTo: assignedTo || null,
            createdBy: req.user._id,
        });
        res.status(201).json(task);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        if (req.user.role === "member") {
            if (task.assignedTo?.toString() !== req.user._id.toString())
                return res.status(403).json({ message: "Not authorized" });
            const updated = await Task.findByIdAndUpdate(
                req.params.id, { status: req.body.status }, { new: true }
            );
            return res.json(updated);
        }

        const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });
        await task.deleteOne();
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getTasks, getDashboard, createTask, updateTask, deleteTask };