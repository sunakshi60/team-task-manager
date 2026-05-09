import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const isActive = (path) => location.pathname.startsWith(path) ? "bg-white/10 text-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "text-slate-300 hover:bg-white/5 hover:text-white transition-all";

    return (
        <>
            <nav className="sticky top-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 font-extrabold text-2xl tracking-tight drop-shadow-md">TeamFlow</span>
                            </div>
                            <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                                <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/dashboard")}`}>
                                    Dashboard
                                </Link>
                                <Link to="/projects" className={`px-3 py-2 rounded-md text-sm font-medium transition ${isActive("/projects")}`}>
                                    Projects
                                </Link>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-300 hidden sm:block">
                                {user?.name} <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full text-xs uppercase ml-1">{user?.role}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-gradient-to-r from-red-500/80 to-pink-600/80 hover:from-red-500 hover:to-pink-600 text-white px-5 py-2 rounded-lg text-sm font-medium transition-all shadow-[0_0_15px_rgba(236,72,153,0.3)] hover:shadow-[0_0_25px_rgba(236,72,153,0.5)] border border-red-400/30 hover:scale-105"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="py-8">
                <Outlet />
            </main>
        </>
    );
}
