import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiEyeLine,
} from "react-icons/ri";
import { recordsApi } from "../api";
import { useAuth } from "../features/auth/AuthContext";
import {
  PageHeader,
  Spinner,
  EmptyState,
  Button,
  StatCard,
  Pagination,
} from "../components/ui/index";
import RecordFormModal from "../features/records/RecordFormModal";
import RecordDetailModal from "../features/records/RecordDetailModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  formatCurrency,
  formatDate,
  getCategoryIcon,
  getErrorMessage,
} from "../utils/helpers";
import toast from "react-hot-toast";
import {
  RiArrowUpLine,
  RiArrowDownLine,
  RiFileList3Line,
} from "react-icons/ri";

export default function MyRecordsPage() {
  const { canCreate, isAdmin } = useAuth();
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);

  const { data = {}, isLoading } = useQuery({
    queryKey: ["my-records", page],
    queryFn: async () => {
      const res = await recordsApi.getMyRecords(page, 10);
      return res.data.data;
    },
  });

  const records = data.records || [];
  const totalPages = data.totalPages || 1;

  const deleteMutation = useMutation({
    mutationFn: (id) => recordsApi.softDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["records"] });
      qc.invalidateQueries({ queryKey: ["my-records"] });
      qc.invalidateQueries({ queryKey: ["deleted-records"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success("Record deleted");
      setDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const filtered = typeFilter
    ? records.filter((r) => r.type === typeFilter)
    : records;
  const totalIncome = records
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + r.amount, 0);
  const totalExpense = records
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + r.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="My Records" subtitle="Your personal financial records">
        {canCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateOpen(true)}
          >
            <RiAddLine size={16} /> New Record
          </Button>
        )}
      </PageHeader>

      {/* Quick stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Total Records"
          value={records.length}
          icon={RiFileList3Line}
        />
        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          accent="var(--income)"
          icon={RiArrowUpLine}
        />
        <StatCard
          label="Total Expense"
          value={formatCurrency(totalExpense)}
          accent="var(--expense)"
          icon={RiArrowDownLine}
        />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["", "income", "expense"].map((t) => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              fontFamily: "Syne",
              background:
                typeFilter === t ? "var(--accent)" : "var(--bg-elevated)",
              color: typeFilter === t ? "#fff" : "var(--text-secondary)",
              border: "1px solid",
              borderColor: typeFilter === t ? "var(--accent)" : "var(--border)",
              cursor: "pointer",
            }}
          >
            {t === "" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Records list */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No records yet"
            description={
              typeFilter
                ? `No ${typeFilter} records found.`
                : "You haven't created any records."
            }
            action={
              canCreate ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                >
                  <RiAddLine size={14} /> Create Record
                </Button>
              ) : null
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Amount</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <motion.tr
                    key={rec._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <td>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0"
                          style={{
                            background:
                              rec.type === "income"
                                ? "var(--income-bg)"
                                : "var(--expense-bg)",
                          }}
                        >
                          {getCategoryIcon(rec.category)}
                        </div>
                        <div>
                          <p
                            className="text-sm font-medium"
                            style={{
                              fontFamily: "Syne",
                              color: "var(--text-primary)",
                            }}
                          >
                            {rec.title}
                          </p>
                          {rec.note && (
                            <p
                              className="text-xs"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {rec.note}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className="font-bold"
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
                        {formatDate(rec.date)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <ActionBtn
                          icon={RiEyeLine}
                          title="View"
                          onClick={() => setViewRecord(rec)}
                        />
                        {canCreate && (
                          <ActionBtn
                            icon={RiEditLine}
                            title="Edit"
                            onClick={() => setEditRecord(rec)}
                            color="var(--accent)"
                          />
                        )}
                        {isAdmin && (
                          <ActionBtn
                            icon={RiDeleteBinLine}
                            title="Delete"
                            onClick={() => setDeleteId(rec._id)}
                            color="var(--expense)"
                          />
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!isLoading && filtered.length > 0 && (
          <div className="px-4 pb-4 mt-2">
            <Pagination
              currentPage={Number(page)}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </div>

      <RecordFormModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
      />
      <RecordFormModal
        isOpen={!!editRecord}
        onClose={() => setEditRecord(null)}
        record={editRecord}
      />
      <RecordDetailModal
        isOpen={!!viewRecord}
        onClose={() => setViewRecord(null)}
        record={viewRecord}
      />
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteMutation.mutate(deleteId)}
        loading={deleteMutation.isPending}
        title="Delete Record"
        description="Are you sure you want to delete this record?"
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
