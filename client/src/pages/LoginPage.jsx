import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiMailLine, RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useAuth } from "../features/auth/AuthContext";
import { Input, Button } from "../components/ui/index";
import { getErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await login(form);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center p-4"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Background glow */}
      <div
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(79,156,249,0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="w-full max-w-sm"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "var(--accent)",
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: 20,
              color: "#fff",
              boxShadow: "0 8px 32px rgba(79,156,249,0.3)",
            }}
          >
            F
          </div>
          <h1
            className="text-2xl font-bold"
            style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
          >
            FinSight
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Finance Data Access Control
          </p>
        </div>

        <div className="card p-6">
          <h2
            className="text-lg font-bold mb-1"
            style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
          >
            Sign in
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Enter your credentials to continue
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <Input
                label="Email"
                type="email"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) =>
                  setForm((p) => ({ ...p, email: e.target.value }))
                }
                error={errors.email}
              />
              <RiMailLine
                size={16}
                className="absolute right-3 bottom-3 pointer-events-none"
                style={{ color: "var(--text-muted)" }}
              />
            </div>

            <div className="relative">
              <Input
                label="Password"
                type={showPwd ? "text" : "password"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) =>
                  setForm((p) => ({ ...p, password: e.target.value }))
                }
                error={errors.password}
              />
              <button
                type="button"
                onClick={() => setShowPwd((p) => !p)}
                className="absolute right-3 bottom-3"
                style={{
                  color: "var(--text-muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {showPwd ? <RiEyeOffLine size={16} /> : <RiEyeLine size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full mt-1"
            >
              Sign in
            </Button>
          </form>

          <p
            className="text-center text-sm mt-5"
            style={{ color: "var(--text-muted)" }}
          >
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
