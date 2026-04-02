import ApiError from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const userIdValidation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "Invalid user ID");
  }

  next();
});

const updateProfileValidation = asyncHandler(async (req, res, next) => {
  const id = req.user._id;
  const updateData = req.body || {};

  const allowedUpdates = ["name", "isActive"];

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Please provide data to update");
  }

  // Validate update fields
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every(
    (update) => allowedUpdates.includes(update) && updateData[update] !== "",
  );

  if (!isValidOperation) {
    throw new ApiError(400, "Invalid updates!");
  }

  if (
    updateData.isActive !== undefined &&
    typeof updateData.isActive !== "boolean"
  ) {
    throw new ApiError(400, "isActive must be a boolean value");
  }

  next();
});

const updateUserByIdValidation = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body || {};
  const allowedUpdates = ["name", "email", "role", "isActive"];

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(401, "Invalid user ID");
  }

  if (!updateData || Object.keys(updateData).length === 0) {
    throw new ApiError(400, "Please provide data to update");
  }

  // Validate update fields
  const updates = Object.keys(updateData);
  const isValidOperation = updates.every(
    (update) => allowedUpdates.includes(update) && updateData[update] !== "",
  );

  if (!isValidOperation) {
    throw new ApiError(400, "Invalid updates!");
  }

  if (!updateData.email && updateData.email !== "") {
    throw new ApiError(400, "Email cannot be empty");
  }

  if (!updateData.name && updateData.name !== "") {
    throw new ApiError(400, "Name cannot be empty");
  }

  if (
    updateData.isActive !== undefined &&
    typeof updateData.isActive !== "boolean"
  ) {
    throw new ApiError(400, "isActive must be a boolean value");
  }

  if (!["viewer", "analyst", "admin"].includes(updateData.role)) {
    throw new ApiError(400, "Invalid role provided");
  }

  next();
});

export { userIdValidation, updateProfileValidation, updateUserByIdValidation };
