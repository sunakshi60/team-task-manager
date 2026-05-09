import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await register(form.name, form.email, form.password, form.role);
            navigate("/dashboard");
        } catch (err) {
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-mesh">
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] p-8 w-full max-w-md relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/30 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-3xl"></div>
                <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 mb-2 relative z-10">Create Account</h2>
                <p className="text-slate-400 mb-6 relative z-10">Join the team task manager</p>

                {error && <div className="bg-red-500/20 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm relative z-10">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                    {[
                        { label: "Full Name", key: "name", type: "text" },
                        { label: "Email", key: "email", type: "email" },
                        { label: "Password", key: "password", type: "password" },
                    ].map(({ label, key, type }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
                            <input
                                type={type} required
                                className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder-slate-500"
                                value={form[key]}
                                onChange={e => setForm({ ...form, [key]: e.target.value })}
                            />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Role</label>
                        <select
                            className="w-full bg-black/20 border border-white/10 text-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all [&>option]:bg-slate-800"
                            value={form.role}
                            onChange={e => setForm({ ...form, role: e.target.value })}
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button
                        type="submit" disabled={loading}
                        className="w-full bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white py-3 rounded-xl transition-all font-semibold shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] disabled:opacity-50 hover:-translate-y-0.5 mt-2"
                    >
                        {loading ? "Creating account..." : "Register"}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-slate-400 relative z-10">
                    Already have an account?{" "}
                    <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 hover:underline transition-colors">Sign In</Link>
                </p>
            </div>
        </div>
    );
}