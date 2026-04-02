import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password -refreshToken").lean();
  return res
    .status(200)
    .json(new ApiResponse(200, "Users retrieved successfully", users));
});

const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id).select("-password -refreshToken").lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User retrieved successfully", user));
});

const updateProfile = asyncHandler(async (req, res) => {
  const id = req.user._id;
  const updateData = req.body || {};

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", user));
});

const updateUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body || {};

  const user = await User.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .select("-password -refreshToken")
    .lean();

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User updated successfully", user));
});

const deleteUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "User deleted successfully", user));
});

const deleteProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndDelete(userId).select(
    "-password -refreshToken",
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, "Profile deleted successfully", user));
});

export {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserById,
  deleteUserById,
  deleteProfile,
};
