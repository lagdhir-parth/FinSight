import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import validateDataUpdates from "../utils/validateDataUpdates.js";

const createRecordValidation = asyncHandler(async (req, res, next) => {
  const { title, amount, type, category, date, note } = req.body;
  const validTypes = ["income", "expense"];
  const validCategories = [
    "salary",
    "freelance",
    "investment",
    "business",
    "food",
    "transport",
    "rent",
    "shopping",
    "entertainment",
    "health",
    "education",
    "utilities",
    "travel",
    "other",
  ];

  if (!title || !type || !category || !date) {
    throw new ApiError(
      400,
      "Please provide all required fields: title, amount, type, category, date",
      [],
      "ValidationError",
    );
  }

  if (typeof amount !== "number" || amount <= 0) {
    throw new ApiError(
      400,
      "Amount must be a valid positive number",
      [],
      "ValidationError",
    );
  }

  if (!validTypes.includes(type)) {
    throw new ApiError(
      400,
      "Invalid type. Must be either 'income' or 'expense'",
      [],
      "ValidationError",
    );
  }

  if (!validCategories.includes(category)) {
    throw new ApiError(400, "Invalid category", [], "ValidationError");
  }

  if (date > new Date()) {
    throw new ApiError(
      400,
      "Date cannot be in the future",
      [],
      "ValidationError",
    );
  }

  next();
});

const recordIdValidation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "Invalid record ID", [], "ValidationError");
  }

  next();
});

const updateRecordValidation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;
  const allowedUpdates = [
    "title",
    "amount",
    "type",
    "category",
    "date",
    "note",
  ];
  const validTypes = ["income", "expense"];
  const validCategories = [
    "salary",
    "freelance",
    "investment",
    "business",
    "food",
    "transport",
    "rent",
    "shopping",
    "entertainment",
    "health",
    "education",
    "utilities",
    "travel",
    "other",
  ];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "Invalid record ID", [], "ValidationError");
  }

  const isValidUpdates = validateDataUpdates(updateData, allowedUpdates);

  if (!isValidUpdates) {
    throw new ApiError(400, "Invalid updates!", [], "ValidationError");
  }

  if (
    updateData.amount !== undefined &&
    (typeof updateData.amount !== "number" || updateData.amount <= 0)
  ) {
    throw new ApiError(
      400,
      "Amount must be a valid positive number",
      [],
      "ValidationError",
    );
  }

  if (updateData.type && !validTypes.includes(updateData.type)) {
    throw new ApiError(
      400,
      "Invalid type. Must be either 'income' or 'expense'",
      [],
      "ValidationError",
    );
  }

  if (updateData.category && !validCategories.includes(updateData.category)) {
    throw new ApiError(400, "Invalid category", [], "ValidationError");
  }

  if (updateData.date && updateData.date > new Date()) {
    throw new ApiError(
      400,
      "Date cannot be in the future",
      [],
      "ValidationError",
    );
  }

  next();
});

export { createRecordValidation, recordIdValidation, updateRecordValidation };
