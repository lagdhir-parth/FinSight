import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import generateTokens from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

const cookieOptions = {
  httpOnly: true,
  secure: true, // REQUIRED for mobile
  sameSite: "None", // REQUIRED for mobile
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
};

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body || {};

  const user = await User.create({ name, email, password, role });

  if (!user) {
    throw new ApiError(500, "Failed to create user");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, "User created successfully", user));
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Invalid email");
  }

  const ispasswordValid = await user.comparePassword(password);

  if (!ispasswordValid) {
    throw new ApiError(400, "Invalid password");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save();

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(new ApiResponse(200, "Login successful", user));
});

const logoutUser = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const loggedOutUser = await User.findByIdAndUpdate(
    userId,
    { refreshToken: null },
    {
      new: true,
      runValidators: false,
    },
  );

  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, "User logged out successfully", loggedOutUser));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  res
    .status(200)
    .json(
      new ApiResponse(200, "Current user retrieved successfully", req.user),
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  const decodedtoken = jwt.verify(
    incomingRefreshToken,
    env.REFRESH_TOKEN_SECRET,
  );

  const user = await User.findById(decodedtoken?._id);

  if (!user || user.refreshToken !== incomingRefreshToken) {
    res.status(401);
    throw new ApiError(401, "Access Denied: Invalid refresh token");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  return res
    .status(200)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .cookie("accessToken", accessToken, cookieOptions)
    .json(
      new ApiResponse(200, "Access token refreshed successfully", {
        accessToken,
        refreshToken,
      }),
    );
});

export {
  registerUser,
  getCurrentUser,
  refreshAccessToken,
  loginUser,
  logoutUser,
};
