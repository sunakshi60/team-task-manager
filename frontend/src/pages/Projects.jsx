import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function Projects() {
    const { user } = useAuth();
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", description: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = () => {
        API.get("/projects")
            .then(res => setProjects(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await API.post("/projects", newProject);
            setShowModal(false);
            setNewProject({ name: "", description: "" });
            fetchProjects();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create project");
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-cyan-300 drop-shadow-sm">Projects</h1>
                    <p className="text-slate-400 mt-1">Manage your team's projects and workflows.</p>
                </div>
                {user?.role === "admin" && (
                    <button
                        onClick={() => setShowModal(true)}
                        className="bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white px-5 py-2.5 rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] border border-white/10 font-medium transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                        New Project
                    </button>
                )}
            </div>

            {projects.length === 0 ? (
                <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-12 text-center relative overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl"></div>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/10 text-cyan-400 mb-6 relative z-10 border border-white/5">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-200 mb-2 relative z-10">No projects yet</h3>
                    <p className="text-slate-400 max-w-sm mx-auto mb-6 relative z-10">Get started by creating a new project to organize your team's tasks.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <Link key={project._id} to={`/projects/${project._id}`} className="group block h-full">
                            <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-lg border border-white/10 p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 h-full flex flex-col hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-indigo-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <h3 className="text-xl font-bold text-slate-100 group-hover:text-cyan-400 transition-colors truncate pr-4">{project.name}</h3>
                                    {project.owner?._id === user?._id && (
                                        <span className="shrink-0 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase tracking-wider px-2 py-1 rounded-md font-bold">Owner</span>
                                    )}
                                </div>
                                <p className="text-slate-400 text-sm mb-6 flex-grow line-clamp-3 relative z-10">
                                    {project.description || "No description provided."}
                                </p>
                                <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/10 relative z-10">
                                    <div className="flex -space-x-2">
                                        {project.members.slice(0, 3).map((m, i) => (
                                            <div key={i} className="w-8 h-8 rounded-full bg-indigo-500 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-white shadow-sm" title={m.name}>
                                                {m.name.charAt(0).toUpperCase()}
                                            </div>
                                        ))}
                                        {project.members.length > 3 && (
                                            <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-slate-900 flex items-center justify-center text-xs font-bold text-slate-300 shadow-sm">
                                                +{project.members.length - 3}
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-xs text-slate-500 ml-2 font-medium">{project.members.length} members</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)] p-6 w-full max-w-md animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-2xl font-bold text-slate-100">New Project</h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-200 transition-colors">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm">{error}</div>}
                        <form onSubmit={handleCreateProject} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Project Name</label>
                                <input
                                    type="text" required
                                    className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500"
                                    value={newProject.name}
                                    onChange={e => setNewProject({ ...newProject, name: e.target.value })}
                                    placeholder="e.g. Website Redesign"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Description</label>
                                <textarea
                                    className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-slate-500 min-h-[100px]"
                                    value={newProject.description}
                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                    placeholder="Brief description of the project goals..."
                                ></textarea>
                            </div>
                            <div className="pt-4 flex justify-end gap-3 border-t border-white/10 mt-6">
                                <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 text-slate-300 font-medium hover:bg-white/5 rounded-xl transition-colors">Cancel</button>
                                <button type="submit" className="px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-medium rounded-xl shadow-[0_0_15px_rgba(99,102,241,0.4)] transition-all">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
