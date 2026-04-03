import Modal from "../../components/ui/Modal";
import {
  formatCurrency,
  formatDate,
  getCategoryIcon,
} from "../../utils/helpers";

export default function RecordDetailModal({ isOpen, onClose, record }) {
  if (!record) return null;

  const rows = [
    { label: "Title", value: record.title },
    {
      label: "Amount",
      value: (
        <span
          style={{
            color:
              record.type === "income" ? "var(--income)" : "var(--expense)",
            fontFamily: "Syne",
            fontWeight: 700,
          }}
        >
          {record.type === "income" ? "+" : "-"}
          {formatCurrency(record.amount)}
        </span>
      ),
    },
    {
      label: "Type",
      value: (
        <span className={`badge-${record.type}`}>
          {record.type === "income" ? "↑" : "↓"} {record.type}
        </span>
      ),
    },
    {
      label: "Category",
      value: (
        <span className="capitalize">
          {getCategoryIcon(record.category)} {record.category}
        </span>
      ),
    },
    { label: "Date", value: formatDate(record.date) },
    record.note && { label: "Note", value: record.note },
    { label: "Created At", value: formatDate(record.createdAt) },
  ].filter(Boolean);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Details" size="sm">
      <div className="flex flex-col gap-3">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-start justify-between gap-4 py-2"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <span
              className="text-xs font-semibold uppercase tracking-wider"
              style={{
                color: "var(--text-muted)",
                fontFamily: "Syne",
                flexShrink: 0,
              }}
            >
              {row.label}
            </span>
            <span
              className="text-sm text-right"
              style={{ color: "var(--text-secondary)" }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
