import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Modal from "../../components/ui/Modal";
import { Input, Select, Textarea, Button } from "../../components/ui/index";
import { recordsApi } from "../../api";
import {
  CATEGORIES,
  INCOME_CATEGORIES,
  formatDateInput,
  getErrorMessage,
} from "../../utils/helpers";
import { useAuth } from "../auth/AuthContext";
import toast from "react-hot-toast";

const EMPTY = {
  title: "",
  amount: "",
  type: "income",
  category: "salary",
  date: "",
  note: "",
};

export default function RecordFormModal({ isOpen, onClose, record = null }) {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const isEdit = !!record;

  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (record) {
      setForm({
        title: record.title || "",
        amount: record.amount || "",
        type: record.type || "income",
        category: record.category || "salary",
        date: formatDateInput(record.date),
        note: record.note || "",
      });
    } else {
      setForm({ ...EMPTY, date: new Date().toISOString().split("T")[0] });
    }
    setErrors({});
  }, [record, isOpen]);

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Title is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = "Valid amount required";
    if (!form.date) e.date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit) {
        // Admin can use admin update, otherwise owner update
        return isAdmin
          ? recordsApi.updateAdmin(record._id, data)
          : recordsApi.updateMine(record._id, data);
      }
      return recordsApi.create(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["records"] });
      qc.invalidateQueries({ queryKey: ["my-records"] });
      qc.invalidateQueries({ queryKey: ["dashboard-stats"] });
      toast.success(isEdit ? "Record updated!" : "Record created!");
      onClose();
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const handleSubmit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    mutation.mutate({ ...form, amount: Number(form.amount) });
  };

  // Auto-set category based on type
  const handleTypeChange = (type) => {
    const defaultCat = type === "income" ? "salary" : "food";
    setForm((p) => ({ ...p, type, category: defaultCat }));
  };

  const filteredCategories =
    form.type === "income"
      ? INCOME_CATEGORIES
      : CATEGORIES.filter((c) => !INCOME_CATEGORIES.includes(c));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Record" : "New Record"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Title"
          placeholder="e.g. Monthly Salary"
          value={form.title}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          error={errors.title}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount (₹)"
            type="number"
            min="1"
            placeholder="0"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            error={errors.amount}
          />
          <Input
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            error={errors.date}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => handleTypeChange(e.target.value)}
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select
            label="Category"
            value={form.category}
            onChange={(e) =>
              setForm((p) => ({ ...p, category: e.target.value }))
            }
          >
            {filteredCategories.map((c) => (
              <option key={c} value={c} className="capitalize">
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </Select>
        </div>

        <Textarea
          label="Note (optional)"
          placeholder="Any additional details..."
          value={form.note}
          onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={mutation.isPending}
          >
            {isEdit ? "Save Changes" : "Create Record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
