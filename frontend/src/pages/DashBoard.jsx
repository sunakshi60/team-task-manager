import { useEffect, useState } from "react";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const StatCard = ({ label, value, color }) => (
    <div className={`bg-white rounded-xl shadow p-5 border-l-4 ${color}`}>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-3xl font-bold mt-1">{value}</p>
    </div>
);

const statusColors = {
    todo: "bg-gray-100 text-gray-700",
    "in-progress": "bg-blue-100 text-blue-700",
    done: "bg-green-100 text-green-700",
};

const priorityColors = {
    low: "bg-green-50 text-green-600",
    medium: "bg-yellow-50 text-yellow-600",
    high: "bg-red-50 text-red-600",
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
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
    );

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">
                    Welcome, {user?.name} 
                </h1>
                <p className="text-gray-500 capitalize">Role: {user?.role}</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Tasks" value={data?.total || 0} color="border-indigo-500" />
                <StatCard label="To Do" value={data?.todo || 0} color="border-gray-400" />
                <StatCard label="In Progress" value={data?.inProgress || 0} color="border-blue-500" />
                <StatCard label="Overdue" value={data?.overdue || 0} color="border-red-500" />
            </div>

            <div className="bg-white rounded-xl shadow p-5">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">My Tasks</h2>
                    <Link to="/projects" className="text-indigo-600 text-sm hover:underline">
                        View Projects →
                    </Link>
                </div>

                {data?.tasks?.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">No tasks assigned yet.</p>
                ) : (
                    <div className="space-y-3">
                        {data?.tasks?.map(task => (
                            <div key={task._id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                                <div>
                                    <p className="font-medium text-gray-800">{task.title}</p>
                                    <p className="text-xs text-gray-400">{task.project?.name}</p>
                                </div>
                                <div className="flex gap-2 items-center">
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColors[task.priority]}`}>
                                        {task.priority}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[task.status]}`}>
                                        {task.status}
                                    </span>
                                    {task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done" && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">
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