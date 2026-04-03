import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";
import validateDataUpdates from "../utils/validateDataUpdates.js";

const userIdValidation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "Invalid user ID", [], "ValidationError");
  }

  next();
});

const updateProfileValidation = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const updateData = req.body || {};
  const allowedUpdates = ["name", "isActive"];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "Invalid user ID", [], "ValidationError");
  }

  const isValidOperation = validateDataUpdates(updateData, allowedUpdates);

  if (!isValidOperation) {
    throw new ApiError(400, "Invalid updates!", [], "ValidationError");
  }

  if (
    updateData.isActive !== undefined &&
    typeof updateData.isActive !== "boolean"
  ) {
    throw new ApiError(
      400,
      "isActive must be a boolean value",
      [],
      "ValidationError",
    );
  }

  next();
});

const updateUserByIdValidation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body || {};
  const allowedUpdates = ["name", "email", "role", "isActive"];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "Invalid user ID", [], "ValidationError");
  }

  const isValidOperation = validateDataUpdates(updateData, allowedUpdates);

  if (!isValidOperation) {
    throw new ApiError(400, "Invalid updates!", [], "ValidationError");
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "email")) {
    if (!updateData.email || String(updateData.email).trim() === "") {
      throw new ApiError(400, "Email cannot be empty", [], "ValidationError");
    }
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "name")) {
    if (!updateData.name || String(updateData.name).trim() === "") {
      throw new ApiError(400, "Name cannot be empty", [], "ValidationError");
    }
  }

  if (
    updateData.isActive !== undefined &&
    typeof updateData.isActive !== "boolean"
  ) {
    throw new ApiError(
      400,
      "isActive must be a boolean value",
      [],
      "ValidationError",
    );
  }

  if (Object.prototype.hasOwnProperty.call(updateData, "role")) {
    if (!["viewer", "analyst", "admin"].includes(updateData.role)) {
      throw new ApiError(400, "Invalid role provided", [], "ValidationError");
    }
  }

  next();
});

export { userIdValidation, updateProfileValidation, updateUserByIdValidation };
