import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../api/authApi";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.detail || "Register failed");
    }
  };

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center p-4">
      <motion.form onSubmit={submit} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass w-full max-w-md rounded-[32px] p-8 shadow-glow">
        <h1 className="text-4xl font-extrabold">Create account</h1>
        <p className="mt-2 text-muted">Start calm collaboration.</p>

        <div className="mt-8 space-y-4">
          <input className="input" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="input" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <motion.button whileTap={{ scale: 0.97 }} className="btn-primary w-full">Register</motion.button>
        </div>

        <p className="mt-6 text-sm text-muted">Already registered? <Link className="text-violet" to="/login">Login</Link></p>
      </motion.form>
    </div>
  );
}