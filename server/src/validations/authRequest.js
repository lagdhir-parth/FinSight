import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import User from "../models/user.model.js";

const registerUserValidation = asyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body || {};

  if (!name || !email || !password) {
    throw new ApiError(
      400,
      "Provide required fields: name, email, password",
      [],
      "ValidationError",
    );
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(400, "Email already in use", [], "ValidationError");
  }

  next();
});

const loginUserValidation = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    throw new ApiError(
      400,
      "Provide required fields: email, password",
      [],
      "ValidationError",
    );
  }

  next();
});

const refreshTokenValidation = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies || {};

  if (!refreshToken) {
    throw new ApiError(
      401,
      "Access Denied: No refresh token provided",
      [],
      "ValidationError",
    );
  }

  next();
});

export { registerUserValidation, loginUserValidation, refreshTokenValidation };
