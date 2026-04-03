import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { RiEyeLine, RiEyeOffLine } from "react-icons/ri";
import { useAuth } from "../features/auth/AuthContext";
import { Input, Button } from "../components/ui/index";
import { getErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "viewer",
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 6) e.password = "Min 6 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success("Account created! Please sign in.");
      navigate("/login");
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
            Create account
          </h2>
          <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
            Join FinSight to manage your records
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              error={errors.name}
            />
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

            <div className="relative mb-2">
              <Input
                label="Password"
                type={showPwd ? "text" : "password"}
                placeholder="Min 6 characters"
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
              Create account
            </Button>
          </form>

          <p
            className="text-center text-sm mt-5"
            style={{ color: "var(--text-muted)" }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold"
              style={{ color: "var(--accent)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
