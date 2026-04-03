// ─── Button ──────────────────────────────────────────────────────────
export function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  className = "",
  ...props
}) {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base",
  };

  const base = `inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]}`;

  const variants = {
    primary: "btn-primary",
    ghost: "btn-ghost",
    danger: "",
  };

  const dangerStyle =
    variant === "danger"
      ? {
          background: "rgba(249,112,82,0.1)",
          color: "var(--expense)",
          border: "1px solid rgba(249,112,82,0.2)",
          borderRadius: "var(--radius-md)",
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontFamily: "Syne",
          fontWeight: 600,
        }
      : {};

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={loading || props.disabled}
      style={{ fontFamily: "Syne", ...dangerStyle, ...props.style }}
      {...props}
    >
      {loading && (
        <span
          className="w-4 h-4 rounded-full border-2 animate-spin"
          style={{
            borderColor: "rgba(255,255,255,0.3)",
            borderTopColor: "currentColor",
          }}
        />
      )}
      {children}
    </button>
  );
}

// ─── Input ───────────────────────────────────────────────────────────
export function Input({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
        >
          {label}
        </label>
      )}
      <input
        className={`input-base px-4 py-2.5 text-sm ${error ? "border-red-500" : ""} ${className}`}
        style={error ? { borderColor: "var(--expense)" } : {}}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: "var(--expense)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Select ──────────────────────────────────────────────────────────
export function Select({ label, error, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
        >
          {label}
        </label>
      )}
      <select
        className={`input-base px-4 py-2.5 text-sm cursor-pointer ${className}`}
        style={{ background: "var(--bg-elevated)" }}
        {...props}
      >
        {children}
      </select>
      {error && (
        <span className="text-xs" style={{ color: "var(--expense)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Textarea ────────────────────────────────────────────────────────
export function Textarea({ label, error, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
        >
          {label}
        </label>
      )}
      <textarea
        className={`input-base px-4 py-2.5 text-sm resize-none ${className}`}
        rows={3}
        {...props}
      />
      {error && (
        <span className="text-xs" style={{ color: "var(--expense)" }}>
          {error}
        </span>
      )}
    </div>
  );
}

// ─── Spinner ─────────────────────────────────────────────────────────
export function Spinner({ size = 24 }) {
  return (
    <div
      className="animate-spin rounded-full border-2"
      style={{
        width: size,
        height: size,
        borderColor: "var(--border)",
        borderTopColor: "var(--accent)",
      }}
    />
  );
}

// ─── Empty State ─────────────────────────────────────────────────────
export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      {icon && <span style={{ fontSize: 48, opacity: 0.3 }}>{icon}</span>}
      <div className="text-center">
        <p
          className="text-base font-semibold mb-1"
          style={{ fontFamily: "Syne", color: "var(--text-secondary)" }}
        >
          {title}
        </p>
        {description && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ─── Page Header ─────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
        >
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
            {subtitle}
          </p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────
export function StatCard({ label, value, sub, accent, icon: Icon }) {
  return (
    <div
      className="card p-5 flex flex-col gap-3 transition-all duration-200"
      style={{ cursor: "default" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.borderColor = "var(--border-light)")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.borderColor = "var(--border)")
      }
    >
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background: accent ? `${accent}18` : "var(--bg-elevated)",
              color: accent || "var(--text-muted)",
            }}
          >
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <p
          className="text-2xl font-bold"
          style={{ fontFamily: "Syne", color: accent || "var(--text-primary)" }}
        >
          {value}
        </p>
        {sub && (
          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ──────────────────────────────────────────────────────
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  for (let i = 1; i <= totalPages; i++) pages.push(i);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-4">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 rounded-lg text-sm transition-all"
        style={{
          background: "var(--bg-elevated)",
          color:
            currentPage === 1 ? "var(--text-muted)" : "var(--text-secondary)",
          border: "1px solid var(--border)",
          fontFamily: "Syne",
          cursor: currentPage === 1 ? "not-allowed" : "pointer",
        }}
      >
        ←
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className="w-8 h-8 rounded-lg text-sm transition-all"
          style={{
            background:
              p === currentPage ? "var(--accent)" : "var(--bg-elevated)",
            color: p === currentPage ? "#fff" : "var(--text-secondary)",
            border: "1px solid",
            borderColor: p === currentPage ? "var(--accent)" : "var(--border)",
            fontFamily: "Syne",
            fontWeight: p === currentPage ? 700 : 400,
            cursor: "pointer",
          }}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 rounded-lg text-sm transition-all"
        style={{
          background: "var(--bg-elevated)",
          color:
            currentPage === totalPages
              ? "var(--text-muted)"
              : "var(--text-secondary)",
          border: "1px solid var(--border)",
          fontFamily: "Syne",
          cursor: currentPage === totalPages ? "not-allowed" : "pointer",
        }}
      >
        →
      </button>
    </div>
  );
}
