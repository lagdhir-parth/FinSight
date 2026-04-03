import asyncHandler from "../utils/asyncHandler.js";
import ApiResponse from "../utils/apiResponse.js";
import Record from "../models/record.model.js";

const dashboardStats = asyncHandler(async (req, res) => {
  const records = await Record.find({ isDeleted: false });
  const userRecords = await Record.find({
    createdBy: req.user._id,
    isDeleted: false,
  }).populate("category", "name");

  const totalRecords = records.length;

  const totalIncome = records
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + record.amount, 0);

  const totalExpense = records
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + record.amount, 0);

  const netBalance = totalIncome - totalExpense;

  const userTotalRecords = userRecords.length;

  const userTotalIncome = userRecords
    .filter((record) => record.type === "income")
    .reduce((sum, record) => sum + record.amount, 0);

  const userTotalExpense = userRecords
    .filter((record) => record.type === "expense")
    .reduce((sum, record) => sum + record.amount, 0);

  const recentActivity = userRecords
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 5);

  const MonthlyTrend = records.reduce((trend, record) => {
    const month = record.createdAt.toLocaleString("default", {
      month: "short",
    });
    const year = record.createdAt.getFullYear();
    const key = `${month} ${year}`;

    if (!trend[key]) {
      trend[key] = { income: 0, expense: 0 };
    }

    trend[key][record.type] += record.amount;

    return trend;
  }, {});

  const categoryWiseStats = records.reduce((stats, record) => {
    if (!stats[record.category]) {
      stats[record.category] = { income: 0, expense: 0 }; // Initialize category if it doesn't exist
    }

    stats[record.category][record.type] += record.amount; // Increment income or expense based on record type

    return stats;
  }, {});

  return res.status(200).json(
    new ApiResponse(200, "Dashboard stats retrieved successfully", {
      totalRecords,
      totalIncome,
      totalExpense,
      netBalance,
      userTotalRecords,
      userTotalIncome,
      userTotalExpense,
      categoryWiseStats,
      recentActivity,
      MonthlyTrend,
    }),
  );
});

export { dashboardStats };
