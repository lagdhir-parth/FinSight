import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  RiDeleteBinLine,
  RiRefreshLine,
  RiSearchLine,
  RiFilter3Line,
  RiShieldStarLine,
} from "react-icons/ri";
import { recordsApi } from "../api";
import { useAuth } from "../features/auth/AuthContext";
import {
  PageHeader,
  Pagination,
  Spinner,
  EmptyState,
  Button,
} from "../components/ui/index";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  formatCurrency,
  formatDate,
  getCategoryIcon,
  getErrorMessage,
} from "../utils/helpers";
import toast from "react-hot-toast";
import { Navigate } from "react-router-dom";

export default function DeletedRecordsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [restoreId, setRestoreId] = useState(null);
  const [permDeleteId, setPermDeleteId] = useState(null);

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Paginated deleted records
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["deleted-records", page],
    queryFn: async () => {
      try {
        const res = await recordsApi.getSoftDeleted(page, 10);
        return res.data.data;
      } catch (err) {
        if (err.response?.status === 404) {
          return { records: [], totalPages: 1, currentPage: page };
        }
        throw err;
      }
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id) => recordsApi.restore(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deleted-records"] });
      qc.invalidateQueries({ queryKey: ["records"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Record restored successfully");
      setRestoreId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const permDeleteMutation = useMutation({
    mutationFn: (id) => recordsApi.permanentDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["deleted-records"] });
      toast.success("Record permanently deleted");
      setPermDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const records = paginatedData?.records || [];
  const totalPages = paginatedData?.totalPages || 1;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Deleted Records"
        subtitle="Manage soft-deleted items across the platform. Admins only."
      />

      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon="🗑️"
            title="No deleted records"
            description="The recycle bin is currently empty."
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title & Ownership</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Deleted At</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((rec) => (
                    <tr key={rec._id}>
                      <td>
                        <span
                          className="font-medium"
                          style={{
                            color: "var(--text-primary)",
                            fontFamily: "Syne",
                          }}
                        >
                          {rec.title}
                        </span>
                        <p
                          className="text-xs mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          By: {rec.createdBy?.name || "Unknown"} (
                          {rec.createdBy?.email || "N/A"})
                        </p>
                      </td>
                      <td>
                        <span
                          className="font-bold text-sm"
                          style={{
                            fontFamily: "Syne",
                            color:
                              rec.type === "income"
                                ? "var(--income)"
                                : "var(--expense)",
                          }}
                        >
                          {rec.type === "income" ? "+" : "-"}
                          {formatCurrency(rec.amount)}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-${rec.type}`}>
                          {rec.type === "income" ? "↑" : "↓"} {rec.type}
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-sm capitalize flex items-center gap-2 shrink-0"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {getCategoryIcon(rec.category)} {rec.category}
                        </span>
                      </td>
                      <td>
                        <span
                          className="text-sm"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {formatDate(rec.updatedAt)}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          <ActionBtn
                            icon={RiRefreshLine}
                            title="Restore"
                            onClick={() => setRestoreId(rec._id)}
                            color="var(--income)"
                          />
                          <ActionBtn
                            icon={RiDeleteBinLine}
                            title="Delete permanently"
                            onClick={() => setPermDeleteId(rec._id)}
                            color="var(--expense)"
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 pb-4">
              <Pagination
                currentPage={Number(page)}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!restoreId}
        onClose={() => setRestoreId(null)}
        onConfirm={() => restoreMutation.mutate(restoreId)}
        loading={restoreMutation.isPending}
        title="Restore Record"
        description="This will restore the record back to the active list."
        confirmLabel="Restore"
      />

      <ConfirmDialog
        isOpen={!!permDeleteId}
        onClose={() => setPermDeleteId(null)}
        onConfirm={() => permDeleteMutation.mutate(permDeleteId)}
        loading={permDeleteMutation.isPending}
        title="Permanently Delete"
        description="This action cannot be undone. The record will be permanently removed."
        confirmLabel="Permanently Delete"
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
      onMouseEnter={(e) => {
        e.currentTarget.style.background = color
          ? `${color}1A`
          : "var(--bg-hover)";
      }}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={15} />
    </button>
  );
}
