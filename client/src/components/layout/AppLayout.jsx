import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiDashboardLine,
  RiFileList3Line,
  RiTeamLine,
  RiUserLine,
  RiLogoutBoxLine,
  RiMenuLine,
  RiCloseLine,
  RiShieldStarLine,
  RiBarChartBoxLine,
  RiEyeLine,
  RiDeleteBinLine,
} from "react-icons/ri";
import { useAuth } from "../../features/auth/AuthContext";
import toast from "react-hot-toast";

const ROLE_CONFIG = {
  admin: { label: "Admin", color: "#f97052", bg: "rgba(249,112,82,0.12)" },
  analyst: { label: "Analyst", color: "#f5c542", bg: "rgba(245,197,66,0.12)" },
  viewer: { label: "Viewer", color: "#4f9cf9", bg: "rgba(79,156,249,0.12)" },
};

const ROLE_ICON = {
  admin: RiShieldStarLine,
  analyst: RiBarChartBoxLine,
  viewer: RiEyeLine,
};

const navItems = [
  { to: "/dashboard", icon: RiDashboardLine, label: "Dashboard" },
  { to: "/records", icon: RiFileList3Line, label: "Records" },
  { to: "/my-records", icon: RiUserLine, label: "My Records", notViewer: true },
  {
    to: "/deleted-records",
    icon: RiDeleteBinLine,
    label: "Deleted Records",
    adminOnly: true,
  },
  { to: "/users", icon: RiTeamLine, label: "Users", adminOnly: true },
  { to: "/profile", icon: RiUserLine, label: "Profile" },
];

export default function AppLayout({ children }) {
  const { user, logout, isAdmin, isAnalyst } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout();
      navigate("/login");
      toast.success("Logged out successfully");
    } catch {
      toast.error("Logout failed");
    } finally {
      setLoggingOut(false);
    }
  };

  const roleConf = ROLE_CONFIG[user?.role] || ROLE_CONFIG.viewer;
  const RoleIcon = ROLE_ICON[user?.role] || RiEyeLine;

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.notViewer && !isAdmin && !isAnalyst) return false;
    return true;
  });

  return (
    <div
      className="flex h-screen overflow-hidden w-full"
      style={{ background: "var(--bg-base)" }}
    >
      {/* Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 lg:hidden"
            style={{
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: 240,
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{
              background: "var(--accent)",
              fontFamily: "Syne",
              fontWeight: 800,
              fontSize: 14,
              color: "#fff",
            }}
          >
            F
          </div>
          <span
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: 16,
              color: "var(--text-primary)",
            }}
          >
            FinSight
          </span>
          <button
            className="ml-auto lg:hidden"
            onClick={() => setSidebarOpen(false)}
            style={{ color: "var(--text-muted)" }}
          >
            <RiCloseLine size={20} />
          </button>
        </div>

        {/* User card */}
        <div
          className="px-4 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center gap-3 px-3 py-3 rounded-xl"
            style={{ background: "var(--bg-elevated)" }}
          >
            <div
              className="flex items-center justify-center w-9 h-9 rounded-full shrink-0"
              style={{
                background: roleConf.bg,
                color: roleConf.color,
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-sm font-medium"
                style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
              >
                {user?.name}
              </p>
              <span
                className="badge-role text-xs"
                style={{
                  background: roleConf.bg,
                  color: roleConf.color,
                  marginTop: 2,
                }}
              >
                <RoleIcon size={10} />
                {roleConf.label}
              </span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p
            className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
          >
            Navigation
          </p>
          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1 text-sm transition-all duration-200 ${
                  isActive ? "nav-active" : "nav-item"
                }`
              }
              style={({ isActive }) => ({
                background: isActive ? "rgba(79,156,249,0.12)" : "transparent",
                color: isActive ? "var(--accent)" : "var(--text-secondary)",
                fontFamily: "DM Sans",
                fontWeight: isActive ? 500 : 400,
              })}
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div
          className="px-3 py-4"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-200"
            style={{ color: "var(--text-secondary)", fontFamily: "DM Sans" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(249,112,82,0.08)";
              e.currentTarget.style.color = "var(--expense)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            <RiLogoutBoxLine size={18} />
            {loggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <div
          className="flex lg:hidden items-center gap-3 px-4 py-3 sticky top-0 z-30"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            style={{ color: "var(--text-secondary)" }}
          >
            <RiMenuLine size={22} />
          </button>
          <span
            style={{
              fontFamily: "Syne",
              fontWeight: 700,
              color: "var(--text-primary)",
            }}
          >
            FinSight
          </span>
        </div>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
