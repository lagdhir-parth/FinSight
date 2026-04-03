import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  RiMoneyDollarCircleLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiFileList3Line,
  RiPulseLine,
} from "react-icons/ri";
import { dashboardApi } from "../api";
import { StatCard, Spinner, EmptyState } from "../components/ui/index";
import { formatCurrency, formatDate, getCategoryIcon } from "../utils/helpers";
import { useAuth } from "../features/auth/AuthContext";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="card-elevated px-4 py-3"
      style={{ border: "1px solid var(--border-light)" }}
    >
      <p
        className="text-xs font-bold mb-2"
        style={{ fontFamily: "Syne", color: "var(--text-muted)" }}
      >
        {label}
      </p>
      {payload.map((p) => (
        <p
          key={p.name}
          className="text-sm"
          style={{ color: p.color, fontFamily: "Syne" }}
        >
          {p.name}: {formatCurrency(p.value)}
        </p>
      ))}
    </div>
  );
};

const STAGGER = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const ITEM = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { user, isAdmin, isAnalyst } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await dashboardApi.getStats();
      return res.data.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Spinner size={36} />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon="⚠️"
        title="Failed to load dashboard"
        description="Please refresh the page."
      />
    );
  }

  const {
    totalRecords,
    totalIncome,
    totalExpense,
    netBalance,
    userTotalRecords,
    userTotalIncome,
    userTotalExpense,
    recentActivity = [],
    MonthlyTrend = {},
    categoryWiseStats = {},
  } = data || {};

  // Convert MonthlyTrend object to array for chart
  const trendData = Object.entries(MonthlyTrend)
    .map(([month, vals]) => ({
      month,
      income: vals.income,
      expense: vals.expense,
    }))
    .slice(-6);

  // Category pie chart data
  const categoryData = Object.entries(categoryWiseStats)
    .map(([cat, vals]) => ({ name: cat, value: vals.income + vals.expense }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  const PIE_COLORS = [
    "#4f9cf9",
    "#22d3a0",
    "#f97052",
    "#f5c542",
    "#a78bfa",
    "#38bdf8",
  ];

  return (
    <motion.div
      variants={STAGGER}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6"
    >
      {/* Header */}
      <motion.div variants={ITEM}>
        <h1
          className="text-2xl font-bold"
          style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
          Welcome back,{" "}
          <span style={{ color: "var(--text-secondary)" }}>{user?.name}</span> ·{" "}
          {new Date().toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </motion.div>

      {/* Global Stats */}
      <motion.div variants={ITEM}>
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
        >
          Platform Overview
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Records"
            value={totalRecords}
            icon={RiFileList3Line}
          />
          <StatCard
            label="Net Balance"
            value={formatCurrency(netBalance)}
            accent={netBalance >= 0 ? "var(--income)" : "var(--expense)"}
            icon={RiMoneyDollarCircleLine}
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
      </motion.div>

      {/* My Stats */}
      {(isAdmin || isAnalyst) && (
        <motion.div variants={ITEM}>
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
          >
            My Activity
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="My Records"
              value={userTotalRecords}
              icon={RiPulseLine}
            />
            <StatCard
              label="My Income"
              value={formatCurrency(userTotalIncome)}
              accent="var(--income)"
              icon={RiArrowUpLine}
            />
            <StatCard
              label="My Expenses"
              value={formatCurrency(userTotalExpense)}
              accent="var(--expense)"
              icon={RiArrowDownLine}
            />
          </div>
        </motion.div>
      )}

      {/* Charts row */}
      <motion.div
        variants={ITEM}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Monthly Trend */}
        <div className="card p-5 lg:col-span-2">
          <p
            className="text-sm font-bold mb-4"
            style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
          >
            Monthly Trend
          </p>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3a0" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#22d3a0" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97052" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#f97052" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{
                    fill: "var(--text-muted)",
                    fontSize: 11,
                    fontFamily: "Syne",
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{
                    fill: "var(--text-muted)",
                    fontSize: 11,
                    fontFamily: "Syne",
                  }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#22d3a0"
                  strokeWidth={2}
                  fill="url(#incomeGrad)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#f97052"
                  strokeWidth={2}
                  fill="url(#expenseGrad)"
                  name="Expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div
              className="h-55 flex items-center justify-center"
              style={{ color: "var(--text-muted)" }}
            >
              No data yet
            </div>
          )}
        </div>

        {/* Category Pie */}
        <div className="card p-5">
          <p
            className="text-sm font-bold mb-4"
            style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
          >
            By Category
          </p>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v) => formatCurrency(v)}
                    contentStyle={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      fontFamily: "Syne",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-1.5 mt-2">
                {categoryData.map((cat, i) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      <span
                        className="capitalize flex items-center gap-1"
                        style={{
                          color: "var(--text-secondary)",
                          fontFamily: "DM Sans",
                        }}
                      >
                        {getCategoryIcon(cat.name)} {cat.name}
                      </span>
                    </div>
                    <span
                      style={{ color: "var(--text-muted)", fontFamily: "Syne" }}
                    >
                      {formatCurrency(cat.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div
              className="h-37.5 flex items-center justify-center"
              style={{ color: "var(--text-muted)" }}
            >
              No data
            </div>
          )}
        </div>
      </motion.div>

      {/* Recent Activity */}
      {(isAdmin || isAnalyst) && (
        <motion.div variants={ITEM}>
          <div className="card">
            <div
              className="px-5 py-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <p
                className="text-sm font-bold"
                style={{ fontFamily: "Syne", color: "var(--text-primary)" }}
              >
                Recent Activity
              </p>
            </div>
            {recentActivity.length === 0 ? (
              <div
                className="py-12 text-center"
                style={{ color: "var(--text-muted)" }}
              >
                No recent activity
              </div>
            ) : (
              <div className="" style={{ borderColor: "var(--border)" }}>
                {recentActivity.map((rec) => (
                  <div
                    key={rec._id}
                    className="flex items-center justify-between px-5 py-3 transition-all"
                    style={{ cursor: "default" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
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
                        <p
                          className="text-xs capitalize"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {rec.category} · {formatDate(rec.date)}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-sm font-bold"
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
