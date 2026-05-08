import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" });
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    const fetchProjectData = async () => {
        setLoading(true);
        try {
            const [projRes, tasksRes] = await Promise.all([
                API.get(`/projects/${id}`),
                API.get(`/tasks?projectId=${id}`)
            ]);
            setProject(projRes.data);
            setTasks(tasksRes.data);
        } catch (err) {
            console.error(err);
            if (err.response?.status === 404) navigate("/projects");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await API.post("/tasks", { ...newTask, projectId: id });
            setShowTaskModal(false);
            setNewTask({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" });
            fetchProjectData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create task");
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await API.post(`/projects/${id}/members`, { email: newMemberEmail });
            setShowMemberModal(false);
            setNewMemberEmail("");
            fetchProjectData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add member");
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await API.put(`/tasks/${taskId}`, { status: newStatus });
            fetchProjectData(); // refresh tasks
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
    );

    if (!project) return null;

    const isAdmin = user?.role === "admin";
    const statusOptions = ["todo", "in-progress", "done"];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{project.name}</h1>
                        <p className="text-gray-600 max-w-2xl text-lg">{project.description}</p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-3 shrink-0">
                            <button onClick={() => setShowMemberModal(true)} className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg shadow-sm font-medium transition">
                                Add Member
                            </button>
                            <button onClick={() => setShowTaskModal(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm font-medium transition">
                                Add Task
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Team Members</span>
                    <div className="flex flex-wrap gap-2">
                        {project.members.map(m => (
                            <div key={m._id} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                                <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                    {m.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-gray-700">{m.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statusOptions.map(status => (
                    <div key={status} className="bg-gray-50/50 rounded-xl p-4 border border-gray-200/60">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-700 capitalize flex items-center gap-2">
                                {status === "todo" && <div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div>}
                                {status === "in-progress" && <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>}
                                {status === "done" && <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>}
                                {status.replace("-", " ")}
                            </h3>
                            <span className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full">
                                {tasks.filter(t => t.status === status).length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {tasks.filter(t => t.status === status).map(task => (
                                <div key={task._id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-900">{task.title}</h4>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md shrink-0 ml-2
                                            ${task.priority === 'high' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                task.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-100' :
                                                    'bg-green-50 text-green-700 border border-green-100'}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{task.description}</p>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                            {task.assignedTo ? (
                                                <div className="flex items-center gap-1.5" title={`Assigned to ${task.assignedTo.name}`}>
                                                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                                                        {task.assignedTo.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="truncate max-w-[80px]">{task.assignedTo.name.split(' ')[0]}</span>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Unassigned</span>
                                            )}
                                        </div>

                                        {(isAdmin || task.assignedTo?._id === user?._id) && (
                                            <select
                                                className="text-xs bg-gray-50 border border-gray-200 text-gray-700 rounded-md py-1 px-2 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none cursor-pointer"
                                                value={task.status}
                                                onChange={(e) => updateTaskStatus(task._id, e.target.value)}
                                            >
                                                <option value="todo">To Do</option>
                                                <option value="in-progress">In Progress</option>
                                                <option value="done">Done</option>
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {tasks.filter(t => t.status === status).length === 0 && (
                                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center text-gray-400 text-sm">
                                    No tasks in this column
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showMemberModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Team Member</h2>
                        {error && <div className="bg-red-50 text-red-600 p-2 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleAddMember}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
                                <input
                                    type="email" required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                                    value={newMemberEmail}
                                    onChange={e => setNewMemberEmail(e.target.value)}
                                    placeholder="colleague@example.com"
                                />
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setShowMemberModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTaskModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Task</h2>
                        {error && <div className="bg-red-50 text-red-600 p-2 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text" required
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none min-h-[80px]"
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                    <select
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
                                    value={newTask.assignedTo}
                                    onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {project.members.map(m => (
                                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-100 rounded-lg">Cancel</button>
                                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
