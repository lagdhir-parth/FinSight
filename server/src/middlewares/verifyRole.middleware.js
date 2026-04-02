import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";

const verifyRole = (requiredRoles) => {
  return asyncHandler(async (req, res, next) => {
    const user = req.user;

    if (!user) {
      throw new ApiError(401, "Unauthorized: No user information found");
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ApiError(
        403,
        "Forbidden: You do not have access to this resource",
      );
    }

    next();
  });
};

export default verifyRole;
