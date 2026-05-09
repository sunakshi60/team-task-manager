import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, color }) => (
    <div className={`bg-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6 relative overflow-hidden group`}>
        <div className={`absolute left-0 top-0 w-1 h-full ${color}`}></div>
        <div className={`absolute -right-4 -top-4 w-24 h-24 ${color.replace('bg-', 'bg-').replace('border-', 'bg-')} opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`}></div>
        <p className="text-sm text-slate-400 font-medium relative z-10">{label}</p>
        <p className="text-4xl font-bold mt-2 text-slate-100 relative z-10">{value}</p>
    </div>
);

const statusColors = {
    todo: "bg-slate-500/20 text-slate-300 border border-slate-500/30",
    "in-progress": "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    done: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
};

const priorityColors = {
    low: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    medium: "bg-amber-500/20 text-amber-300 border border-amber-500/30",
    high: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
};

export default function Dashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/tasks/dashboard")
            .then(r => setData(r.data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="flex items-center justify-center min-h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 drop-shadow-sm">
                    Welcome, {user?.name} 
                </h1>
                <p className="text-slate-400 capitalize mt-1 font-medium">Role: {user?.role}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
                <StatCard label="Total Tasks" value={data?.total || 0} color="bg-indigo-500" />
                <StatCard label="To Do" value={data?.todo || 0} color="bg-slate-400" />
                <StatCard label="In Progress" value={data?.inProgress || 0} color="bg-cyan-500" />
                <StatCard label="Overdue" value={data?.overdue || 0} color="bg-rose-500" />
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-100">My Tasks</h2>
                    <Link to="/projects" className="text-cyan-400 text-sm hover:text-cyan-300 hover:underline transition-colors font-medium">
                        View Projects →
                    </Link>
                </div>

                {data?.tasks?.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-slate-500">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                        </div>
                        <p className="text-slate-400 font-medium">No tasks assigned yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {data?.tasks?.map(task => (
                            <div key={task._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border border-white/5 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_20px_rgba(0,0,0,0.2)] gap-4">
                                <div>
                                    <p className="font-semibold text-slate-100 text-lg">{task.title}</p>
                                    <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg>
                                        {task.project?.name}
                                    </p>
                                </div>
                                <div className="flex flex-wrap gap-2 items-center">
                                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold ${priorityColors[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                    <span className={`text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold ${statusColors[task.status]}`}>
                                        {task.status}
                                    </span>
                                    {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done" && (
                                        <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                                            Overdue
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}