import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";

export default function ProjectDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [project, setProject] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showTaskModal, setShowTaskModal] = useState(false);
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [newTask, setNewTask] = useState({ title: "", description: "", priority: "medium", dueDate: "", assignedTo: "" });
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [usersList, setUsersList] = useState([]);
    const [error, setError] = useState("");
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: "", message: "", onConfirm: null });

    useEffect(() => {
        fetchProjectData();
    }, [id]);

    useEffect(() => {
        if (user?.role === "admin") {
            const fetchUsers = async () => {
                try {
                    const res = await API.get("/users");
                    setUsersList(res.data);
                } catch (err) {
                    console.error("Failed to fetch users", err);
                }
            };
            fetchUsers();
        }
    }, [user]);

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
            toast.success("Task created successfully!");
            fetchProjectData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create task");
            toast.error(err.response?.data?.message || "Failed to create task");
        }
    };

    const handleAddMember = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await API.post(`/projects/${id}/members`, { email: newMemberEmail });
            setShowMemberModal(false);
            setNewMemberEmail("");
            toast.success("Member added successfully!");
            fetchProjectData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add member");
            toast.error(err.response?.data?.message || "Failed to add member");
        }
    };

    const updateTaskStatus = async (taskId, newStatus) => {
        try {
            await API.put(`/tasks/${taskId}`, { status: newStatus });
            if (newStatus === "done") {
                toast.success("Task marked as done! 🎉");
            } else {
                toast.info(`Task moved to ${newStatus.replace("-", " ")}`);
            }
            fetchProjectData(); // refresh tasks
        } catch (err) {
            console.error("Failed to update status", err);
            toast.error("Failed to update task status");
        }
    };

    const removeUserFromTask = async (taskId) => {
        try {
            await API.put(`/tasks/${taskId}`, { assignedTo: null });
            fetchProjectData();
            setSelectedTask(prev => prev ? { ...prev, assignedTo: null } : null);
            toast.info("User removed from task");
        } catch (err) {
            console.error("Failed to unassign task", err);
            toast.error("Failed to unassign task");
        }
    };

    const handleDeleteTask = async (taskId) => {
        setConfirmModal({
            isOpen: true,
            title: "Delete Task",
            message: "Are you sure you want to delete this task?",
            onConfirm: async () => {
                try {
                    await API.delete(`/tasks/${taskId}`);
                    fetchProjectData();
                    setSelectedTask(null);
                    toast.success("Task deleted successfully");
                } catch (err) {
                    console.error("Failed to delete task", err);
                    toast.error("Failed to delete task");
                }
            }
        });
    };

    const handleRemoveMember = async (memberId) => {
        setConfirmModal({
            isOpen: true,
            title: "Remove Member",
            message: "Are you sure you want to remove this user from the project? This will also unassign them from any tasks.",
            onConfirm: async () => {
                try {
                    const updatedMembers = project.members.filter(m => m._id !== memberId).map(m => m._id);
                    await API.put(`/projects/${id}`, { members: updatedMembers });

                    // Unassign tasks assigned to this user in this project
                    const tasksToUnassign = tasks.filter(t => t.assignedTo?._id === memberId);
                    for (const task of tasksToUnassign) {
                        await API.put(`/tasks/${task._id}`, { assignedTo: null });
                    }

                    toast.info("Member removed from project");
                    fetchProjectData();
                } catch (err) {
                    console.error("Failed to remove member", err);
                    toast.error("Failed to remove member");
                }
            }
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
        </div>
    );

    if (!project) return null;

    const isAdmin = user?.role === "admin";
    const statusOptions = ["todo", "in-progress", "done"];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl shadow-xl border border-white/10 p-8 mb-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-indigo-400 to-cyan-400 shadow-[0_0_15px_rgba(99,102,241,0.8)]"></div>
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 relative z-10">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-100 mb-2">{project.name}</h1>
                        <p className="text-slate-400 max-w-2xl text-lg">{project.description}</p>
                    </div>
                    {isAdmin && (
                        <div className="flex gap-3 shrink-0">
                            <button onClick={() => setShowMemberModal(true)} className="bg-white/10 border border-white/20 hover:bg-white/20 text-slate-200 px-5 py-2.5 rounded-xl shadow-sm font-medium transition-all hover:scale-105">
                                Add Member
                            </button>
                            <button onClick={() => setShowTaskModal(true)} className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] font-medium transition-all hover:scale-105 border border-white/10">
                                Add Task
                            </button>
                        </div>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 flex items-center gap-4 relative z-10">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Team Members</span>
                    <div className="flex flex-wrap gap-2">
                        {project.members.map(m => (
                            <div key={m._id} className="group/member flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 shadow-sm hover:bg-white/10 transition-colors">
                                <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                                    {m.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-sm font-medium text-slate-300">{m.name}</span>
                                {isAdmin && project.owner !== m._id && (
                                    <button
                                        onClick={() => handleRemoveMember(m._id)}
                                        className="opacity-0 group-hover/member:opacity-100 ml-1 text-slate-500 hover:text-rose-400 transition-all duration-200"
                                        title="Remove Member"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statusOptions.map(status => (
                    <div key={status} className="bg-black/20 rounded-2xl p-5 border border-white/5 backdrop-blur-md shadow-inner">
                        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                            <h3 className="font-bold text-slate-200 capitalize flex items-center gap-2">
                                {status === "todo" && <div className="w-3 h-3 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.8)]"></div>}
                                {status === "in-progress" && <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>}
                                {status === "done" && <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>}
                                {status.replace("-", " ")}
                            </h3>
                            <span className="bg-white/10 border border-white/20 text-slate-300 text-xs font-bold px-2.5 py-1 rounded-full">
                                {tasks.filter(t => t.status === status).length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {tasks.filter(t => t.status === status).map(task => (
                                <div key={task._id} onClick={() => setSelectedTask(task)} className="bg-white/5 p-5 rounded-xl shadow-lg border border-white/10 hover:bg-white/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-bold text-slate-100">{task.title}</h4>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-md shrink-0 ml-2
                                            ${task.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                                task.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                            {task.priority}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-400 mb-5 line-clamp-2">{task.description}</p>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                            {task.assignedTo ? (
                                                <div className="flex items-center gap-2" title={`Assigned to ${task.assignedTo.name}`}>
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                                                        {task.assignedTo.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="truncate max-w-[80px] text-slate-300">{task.assignedTo.name.split(' ')[0]}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500 italic">Unassigned</span>
                                            )}
                                        </div>

                                        {(isAdmin || task.assignedTo?._id === user?._id) && (
                                            <select
                                                onClick={(e) => e.stopPropagation()}
                                                className="text-xs bg-black/40 border border-white/20 text-slate-300 rounded-lg py-1.5 px-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none cursor-pointer hover:bg-white/5 transition-colors [&>option]:bg-slate-800"
                                                value={task.status}
                                                onChange={(e) => { e.stopPropagation(); updateTaskStatus(task._id, e.target.value); }}
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
                                <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center text-slate-500 text-sm font-medium">
                                    No tasks in this column
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {showMemberModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-100 mb-4">Add Team Member</h2>
                        {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleAddMember}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-slate-300 mb-1">Select User</label>
                                <select
                                    required
                                    className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent [&>option]:bg-slate-800"
                                    value={newMemberEmail}
                                    onChange={e => setNewMemberEmail(e.target.value)}
                                >
                                    <option value="">-- Choose a user --</option>
                                    {usersList.map(u => (
                                        <option key={u._id} value={u.email}>
                                            {u.name} ({u.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/10">
                                <button type="button" onClick={() => setShowMemberModal(false)} className="px-5 py-2.5 text-slate-300 font-medium hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-medium rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">Add</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showTaskModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200">
                        <h2 className="text-2xl font-bold text-slate-100 mb-5">Create New Task</h2>
                        {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleCreateTask} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                                <input
                                    type="text" required
                                    className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500"
                                    value={newTask.title}
                                    onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500 min-h-[80px]"
                                    value={newTask.description}
                                    onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Priority</label>
                                    <select
                                        className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent [&>option]:bg-slate-800"
                                        value={newTask.priority}
                                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent [color-scheme:dark]"
                                        value={newTask.dueDate}
                                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Assignee</label>
                                <select
                                    className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent [&>option]:bg-slate-800"
                                    value={newTask.assignedTo}
                                    onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                                >
                                    <option value="">Unassigned</option>
                                    {project.members.map(m => (
                                        <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-white/10">
                                <button type="button" onClick={() => setShowTaskModal(false)} className="px-5 py-2.5 text-slate-300 font-medium hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-medium rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedTask && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedTask(null)}>
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 w-full max-w-lg animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-5">
                            <h2 className="text-2xl font-bold text-slate-100 pr-8">{selectedTask.title}</h2>
                            <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-slate-200 transition-colors shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <p className="text-slate-300 mb-6">{selectedTask.description}</p>

                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-slate-400">Status</span>
                                <span className="text-slate-100 capitalize font-medium">{selectedTask.status.replace("-", " ")}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-slate-400">Priority</span>
                                <span className={`text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded-md
                                    ${selectedTask.priority === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                                        selectedTask.priority === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                    {selectedTask.priority}
                                </span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-slate-400">Due Date</span>
                                <span className="text-slate-100 font-medium">{selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'None'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/10 pb-3">
                                <span className="text-slate-400">Assignee</span>
                                <div className="flex items-center gap-3">
                                    {selectedTask.assignedTo ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                                                {selectedTask.assignedTo.name.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-slate-100 font-medium">{selectedTask.assignedTo.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-slate-500 italic">Unassigned</span>
                                    )}
                                    {isAdmin && selectedTask.assignedTo && (
                                        <button
                                            onClick={() => removeUserFromTask(selectedTask._id)}
                                            className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            Remove User
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-6">
                            {isAdmin ? (
                                <button onClick={() => handleDeleteTask(selectedTask._id)} className="px-5 py-2.5 bg-rose-500/20 text-rose-400 font-medium hover:bg-rose-500/30 border border-rose-500/30 rounded-xl transition-colors">Delete Task</button>
                            ) : (
                                <div></div>
                            )}
                            <button onClick={() => setSelectedTask(null)} className="px-5 py-2.5 bg-white/10 text-slate-200 font-medium hover:bg-white/20 rounded-xl transition-colors">Close</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
                    <div className="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 w-full max-w-sm animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-100 mb-2">{confirmModal.title}</h2>
                        <p className="text-slate-300 text-sm mb-6">{confirmModal.message}</p>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                            <button
                                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                className="px-4 py-2 text-slate-300 font-medium hover:bg-white/5 rounded-lg transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    confirmModal.onConfirm();
                                    setConfirmModal({ ...confirmModal, isOpen: false });
                                }}
                                className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg shadow-[0_0_15px_rgba(225,29,72,0.4)] transition-all text-sm"
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
