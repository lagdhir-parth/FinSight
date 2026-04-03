import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  RiUserLine,
  RiMailLine,
  RiShieldStarLine,
  RiBarChartBoxLine,
  RiEyeLine,
  RiDeleteBinLine,
  RiKey2Line,
} from "react-icons/ri";
import { useAuth } from "../features/auth/AuthContext";
import { Input, Button, PageHeader, Spinner } from "../components/ui/index";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { usersApi } from "../api";
import { formatDate, getErrorMessage } from "../utils/helpers";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    color: "#f97052",
    bg: "rgba(249,112,82,0.12)",
    Icon: RiShieldStarLine,
    desc: "Full access to all features, records and users.",
  },
  analyst: {
    label: "Analyst",
    color: "#f5c542",
    bg: "rgba(245,197,66,0.12)",
    Icon: RiBarChartBoxLine,
    desc: "Can create records and view all users.",
  },
  viewer: {
    label: "Viewer",
    color: "#4f9cf9",
    bg: "rgba(79,156,249,0.12)",
    Icon: RiEyeLine,
    desc: "Read-only access to financial records.",
  },
};

export default function ProfilePage() {
  const { user, refetchUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: user?.name || "" });
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    setForm({ name: user?.name || "" });
  }, [user?.name]);

  const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG.viewer;

  const updateMutation = useMutation({
    mutationFn: (data) => usersApi.updateProfile(data),
    onSuccess: () => {
      refetchUser();
      toast.success("Profile updated!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteProfile(),
    onSuccess: async () => {
      await logout();
      navigate("/login");
      toast.success("Account deleted");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  if (!user)
    return (
      <div className="flex justify-center p-12">
        <Spinner size={32} />
      </div>
    );

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full">
      <PageHeader
        title="Profile Settings"
        subtitle="Manage your personal information and preferences"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          {/* Avatar & Role card */}
          <motion.div
            className="rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div
              className="absolute top-0 left-0 w-full h-24"
              style={{
                background: `linear-gradient(to bottom, ${roleConf.bg}, transparent)`,
              }}
            />
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold relative z-10 mb-4 shadow-xl"
              style={{
                background: roleConf.bg,
                color: roleConf.color,
                fontFamily: "Syne",
                border: `4px solid var(--bg-surface)`,
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <h2
              className="text-xl font-bold relative z-10"
              style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
            >
              {user?.name}
            </h2>
            <p
              className="text-sm relative z-10 mb-3"
              style={{ color: "var(--text-muted)" }}
            >
              {user?.email}
            </p>

            <span
              className="badge-role relative z-10 px-3 py-1.5"
              style={{
                background: roleConf.bg,
                color: roleConf.color,
                fontSize: 13,
              }}
            >
              <roleConf.Icon size={14} /> {roleConf.label}
            </span>
          </motion.div>

          {/* Account Details Mini-Cards */}
          <motion.div
            className="flex flex-col gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{
                  background: "rgba(34,211,160,0.1)",
                  color: "var(--income)",
                }}
              >
                <RiUserLine size={18} />
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider font-semibold"
                  style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
                >
                  Status
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {user?.isActive ? "Active Account" : "Inactive"}
                </p>
              </div>
            </div>

            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: "rgba(79,156,249,0.1)", color: "#4f9cf9" }}
              >
                <RiKey2Line size={18} />
              </div>
              <div>
                <p
                  className="text-xs uppercase tracking-wider font-semibold"
                  style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
                >
                  Account ID
                </p>
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {user?._id?.slice(-8)}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Edit profile */}
          <motion.div
            className="rounded-2xl p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.02)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h3
              className="text-lg font-bold mb-1"
              style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
            >
              Personal Information
            </h3>
            <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
              Update your personal details here.
            </p>

            <div className="flex flex-col gap-5">
              <div className="relative">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
                <RiUserLine
                  size={16}
                  className="absolute right-4 bottom-3.5 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
              <div className="relative">
                <Input
                  label="Email Address"
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  disabled
                />
                <RiMailLine
                  size={16}
                  className="absolute right-4 bottom-3.5 pointer-events-none"
                  style={{ color: "var(--text-muted)" }}
                />
              </div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Email is read-only. For email updates, please contact support.
              </p>

              <div
                className="flex justify-end mt-2 pt-5"
                style={{ borderTop: "1px solid var(--border-light)" }}
              >
                <Button
                  variant="primary"
                  loading={updateMutation.isPending}
                  onClick={() => updateMutation.mutate({ name: form.name })}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Role permissions */}
          <motion.div
            className="rounded-2xl p-6"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <h3
              className="text-lg font-bold mb-1"
              style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
            >
              Role Capabilities
            </h3>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Information regarding what you can and cannot do.
            </p>

            <div
              className="flex items-center gap-4 p-4 rounded-xl"
              style={{ background: roleConf.bg }}
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center bg-white shadow-sm"
                style={{ color: roleConf.color }}
              >
                <roleConf.Icon size={24} />
              </div>
              <div>
                <p
                  className="text-base font-bold"
                  style={{ fontFamily: "Syne", color: roleConf.color }}
                >
                  {roleConf.label}
                </p>
                <p
                  className="text-sm mt-0.5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {roleConf.desc}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              border: "1px solid rgba(249,112,82,0.3)",
              background: "var(--bg-surface)",
            }}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{ background: "var(--expense)" }}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pl-3">
              <div>
                <h3
                  className="text-lg font-bold mb-1"
                  style={{ fontFamily: "Syne", color: "var(--expense)" }}
                >
                  Delete Account
                </h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Permanently remove your account and all associated data. This
                  action is irreversible.
                </p>
              </div>
              <Button
                variant="danger"
                onClick={() => setDeleteOpen(true)}
                className="whitespace-nowrap"
              >
                <RiDeleteBinLine size={16} /> Delete Account
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        title="Delete Account"
        description="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmLabel="Delete My Account"
      />
    </div>
  );
}
