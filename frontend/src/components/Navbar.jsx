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

    const isActive = (path) => location.pathname.startsWith(path) ? "bg-indigo-700 text-white" : "text-indigo-100 hover:bg-indigo-600 hover:text-white";

    return (
        <>
            <nav className="bg-indigo-600 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-8">
                            <div className="flex-shrink-0 flex items-center">
                                <span className="text-white font-bold text-xl tracking-tight">TeamFlow</span>
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
                            <span className="text-sm text-indigo-100 hidden sm:block">
                                {user?.name} <span className="bg-indigo-500 px-2 py-0.5 rounded-full text-xs uppercase ml-1">{user?.role}</span>
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-md text-sm font-medium transition shadow-sm"
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
