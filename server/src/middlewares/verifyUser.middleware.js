import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import env from "../config/env.js";

const verifyUser = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(
      401,
      "Access Denied: Unauthorized access, No Token Provided",
    );
  }

  try {
    const decoded = jwt.verify(token, env.ACCESS_TOKEN_SECRET);

    const { _id } = decoded || {};

    const user = await User.findById(_id).select("-password -refreshToken");

    if (!user) {
      throw new ApiError(401, "Access Denied: Invalid Token");
    }

    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, "Access Denied: Invalid Token");
  }
});

export default verifyUser;
