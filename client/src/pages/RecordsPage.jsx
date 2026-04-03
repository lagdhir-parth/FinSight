import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  RiSearchLine,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiFilter3Line,
  RiEyeLine,
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
import RecordFormModal from "../features/records/RecordFormModal";
import RecordDetailModal from "../features/records/RecordDetailModal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import {
  formatCurrency,
  formatDate,
  getCategoryIcon,
  CATEGORIES,
  getErrorMessage,
} from "../utils/helpers";
import toast from "react-hot-toast";

export default function RecordsPage() {
  const { canCreate, isAdmin } = useAuth();
  const qc = useQueryClient();

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState({ title: "", type: "", category: "" });
  const [searchMode, setSearchMode] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [permDeleteId, setPermDeleteId] = useState(null);

  // Paginated records
  const { data: paginatedData, isLoading } = useQuery({
    queryKey: ["records", page],
    queryFn: async () => {
      try {
        const res = await recordsApi.getPaginated(page, 10);
        return res.data.data;
      } catch (err) {
        if (err.response?.status === 404) {
          return { records: [], totalPages: 1, currentPage: page };
        }
        throw err;
      }
    },
    enabled: !searchMode,
  });

  // Search records
  const { data: searchData, isLoading: searchLoading } = useQuery({
    queryKey: ["records-search", search],
    queryFn: async () => {
      const params = {};
      if (search.title) params.title = search.title;
      if (search.type) params.type = search.type;
      if (search.category) params.category = search.category;
      const res = await recordsApi.search(params);
      return res.data.data;
    },
    enabled: searchMode,
  });

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

  const permDeleteMutation = useMutation({
    mutationFn: (id) => recordsApi.permanentDelete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["records"] });
      toast.success("Record permanently deleted");
      setPermDeleteId(null);
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const records = searchMode ? searchData || [] : paginatedData?.records || [];
  const totalPages = paginatedData?.totalPages || 1;
  const loading = searchMode ? searchLoading : isLoading;

  const isSearchActive = search.title || search.type || search.category;

  const handleSearchChange = (field, val) => {
    setSearch((p) => ({ ...p, [field]: val }));
    setSearchMode(
      !!(
        val ||
        (field !== "title" ? search.title : "") ||
        (field !== "type" ? search.type : "") ||
        (field !== "category" ? search.category : "")
      ),
    );
  };

  const clearSearch = () => {
    setSearch({ title: "", type: "", category: "" });
    setSearchMode(false);
  };

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Records"
        subtitle="All financial records across the platform"
      >
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

      {/* Search & Filters */}
      <div className="card p-4 flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <RiSearchLine
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            />
            <input
              className="input-base pl-9 pr-4 py-2.5 text-sm"
              placeholder="Search by title..."
              value={search.title}
              onChange={(e) => handleSearchChange("title", e.target.value)}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters((p) => !p)}
            style={{ gap: 6 }}
          >
            <RiFilter3Line size={15} />
            Filters{" "}
            {isSearchActive && (
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "var(--accent)" }}
              />
            )}
          </Button>
          {isSearchActive && (
            <Button variant="ghost" size="sm" onClick={clearSearch}>
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
          >
            <select
              className="input-base px-3 py-2 text-sm"
              value={search.type}
              onChange={(e) => handleSearchChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select
              className="input-base px-3 py-2 text-sm"
              value={search.category}
              onChange={(e) => handleSearchChange("category", e.target.value)}
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </motion.div>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size={32} />
          </div>
        ) : records.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No records found"
            description={
              isSearchActive
                ? "Try adjusting your search filters."
                : "No financial records exist yet."
            }
            action={
              canCreate && !isSearchActive ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setCreateOpen(true)}
                >
                  <RiAddLine size={14} /> Create first record
                </Button>
              ) : null
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Amount</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Date</th>
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
                        {rec.note && (
                          <p
                            className="text-xs mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {rec.note}
                          </p>
                        )}
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
                          className="text-sm capitalize flex items-center gap-2"
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
                            <>
                              <ActionBtn
                                icon={RiDeleteBinLine}
                                title="Delete"
                                onClick={() => setDeleteId(rec._id)}
                                color="var(--expense)"
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!searchMode && (
              <div className="px-4 pb-4">
                <Pagination
                  currentPage={Number(page)}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
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
        description="This will soft-delete the record. It can be recovered by an admin."
        confirmLabel="Delete"
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
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "var(--bg-hover)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <Icon size={15} />
    </button>
  );
}
