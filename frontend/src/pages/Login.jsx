import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe, loginUser } from "../api/authApi";
import { useAuthStore } from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [form, setForm] = useState({ email: "owner@test.com", password: "password123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const tokenData = await loginUser(form);
      localStorage.setItem("notion_token", tokenData.access_token);
      const user = await getMe();
      setAuth(tokenData.access_token, user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center p-4">
      <motion.form onSubmit={submit} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass w-full max-w-md rounded-[32px] p-8 shadow-glow">
        <h1 className="text-4xl font-extrabold">Welcome back</h1>
        <p className="mt-2 text-muted">Login to your real-time workspace.</p>

        <div className="mt-8 space-y-4">
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <motion.button whileTap={{ scale: 0.97 }} className="btn-primary w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </motion.button>
        </div>

        <p className="mt-6 text-sm text-muted">No account? <Link className="text-violet" to="/register">Register</Link></p>
      </motion.form>
    </div>
  );
}