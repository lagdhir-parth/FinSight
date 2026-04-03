import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  RiEditLine,
  RiDeleteBinLine,
  RiShieldStarLine,
  RiBarChartBoxLine,
  RiEyeLine,
} from "react-icons/ri";
import { usersApi } from "../api";
import { useAuth } from "../features/auth/AuthContext";
import {
  PageHeader,
  Spinner,
  EmptyState,
  Button,
} from "../components/ui/index";
import Modal from "../components/ui/Modal";
import { Input, Select } from "../components/ui/index";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import { formatDate, getErrorMessage } from "../utils/helpers";
import toast from "react-hot-toast";

const ROLE_CONFIG = {
  admin: {
    label: "Admin",
    color: "#f97052",
    bg: "rgba(249,112,82,0.12)",
    Icon: RiShieldStarLine,
  },
  analyst: {
    label: "Analyst",
    color: "#f5c542",
    bg: "rgba(245,197,66,0.12)",
    Icon: RiBarChartBoxLine,
  },
  viewer: {
    label: "Viewer",
    color: "#4f9cf9",
    bg: "rgba(79,156,249,0.12)",
    Icon: RiEyeLine,
  },
};

function RoleBadge({ role }) {
  const conf = ROLE_CONFIG[role] || ROLE_CONFIG.viewer;
  return (
    <span
      className="badge-role"
      style={{ background: conf.bg, color: conf.color }}
    >
      <conf.Icon size={10} /> {conf.label}
    </span>
  );
}

function EditUserModal({ user, isOpen, onClose }) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: user?.name || "",
    role: user?.role || "viewer",
    isActive: user?.isActive ?? true,
  });

  const mutation = useMutation({
    mutationFn: (data) => usersApi.updateById(user._id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated");
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit User" size="sm">
      <div className="flex flex-col gap-4">
        <Input
          label="Name"
          value={form.name}
          onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
        />
        <Select
          label="Role"
          value={form.role}
          onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
        >
          <option value="viewer">Viewer</option>
          <option value="analyst">Analyst</option>
          <option value="admin">Admin</option>
        </Select>
        <Select
          label="Status"
          value={form.isActive ? "active" : "inactive"}
          onChange={(e) =>
            setForm((p) => ({ ...p, isActive: e.target.value === "active" }))
          }
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </Select>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            loading={mutation.isPending}
            onClick={() => mutation.mutate(form)}
          >
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function UsersPage() {
  const { isAdmin, user: me } = useAuth();
  const qc = useQueryClient();
  const [editUser, setEditUser] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [roleFilter, setRoleFilter] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await usersApi.getAll();
      return res.data.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersApi.deleteById(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted");
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const filtered = roleFilter
    ? users.filter((u) => u.role === roleFilter)
    : users;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        subtitle={`${users.length} registered user${users.length !== 1 ? "s" : ""}`}
      />

      {/* Role filter */}
      <div className="flex gap-2">
        {["", "admin", "analyst", "viewer"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize"
            style={{
              fontFamily: "Syne",
              background:
                roleFilter === r ? "var(--accent)" : "var(--bg-elevated)",
              color: roleFilter === r ? "#fff" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: roleFilter === r ? "var(--accent)" : "var(--border)",
              cursor: "pointer",
            }}
          >
            {r || "All"}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="👥" title="No users found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{
                            background:
                              ROLE_CONFIG[u.role]?.bg || "var(--bg-elevated)",
                            color:
                              ROLE_CONFIG[u.role]?.color || "var(--text-muted)",
                            fontFamily: "Syne",
                          }}
                        >
                          {u.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              fontFamily: "Syne",
                              color: "var(--text-primary)",
                            }}
                          >
                            {u.name}{" "}
                            {u._id === me?._id && (
                              <span
                                className="text-xs"
                                style={{ color: "var(--accent)" }}
                              >
                                (you)
                              </span>
                            )}
                          </p>
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <RoleBadge role={u.role} />
                    </td>
                    <td>
                      <span
                        className="badge-role"
                        style={{
                          background: u.isActive
                            ? "rgba(34,211,160,0.1)"
                            : "rgba(85,94,114,0.2)",
                          color: u.isActive
                            ? "var(--income)"
                            : "var(--text-muted)",
                        }}
                      >
                        {u.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td>
                      <span
                        className="text-sm"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDate(u.createdAt)}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        {u._id !== me?._id && (
                          <div className="flex items-center gap-1">
                            <ActionBtn
                              icon={RiEditLine}
                              title="Edit"
                              onClick={() => setEditUser(u)}
                              color="var(--accent)"
                            />
                            <ActionBtn
                              icon={RiDeleteBinLine}
                              title="Delete"
                              onClick={() => setDeleteId(u._id)}
                              color="var(--expense)"
                            />
                          </div>
                        )}
                      </td>
                    )}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editUser && (
        <EditUserModal
          user={editUser}
          isOpen={!!editUser}
          onClose={() => setEditUser(null)}
        />
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete User"
        description="This will permanently remove the user account. This cannot be undone."
      />
    </div>
  );
}

function ActionBtn({ icon: Icon, title, onClick, color }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
      style={{ color: color || "var(--text-muted)", background: "transparent" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-hover)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={15} />
    </button>
  );
}
