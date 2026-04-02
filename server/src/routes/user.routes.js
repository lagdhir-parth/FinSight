import { Router } from "express";
import verifyRole from "../middlewares/verifyRole.middleware.js";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserById,
  deleteUserById,
  deleteProfile,
} from "../controllers/user.controller.js";
import {
  userIdValidation,
  updateProfileValidation,
  updateUserByIdValidation,
} from "../validations/userRequest.js";

const router = Router();

// User routes
router.get("/:id", verifyUser, userIdValidation, getUserById);
router.patch("/profile", verifyUser, updateProfileValidation, updateProfile);
router.delete("/profile", verifyUser, deleteProfile);

// Admin routes
router.get("/", verifyUser, verifyRole(["admin", "analyst"]), getAllUsers);
router.patch(
  "/:id",
  verifyUser,
  verifyRole(["admin"]),
  updateUserByIdValidation,
  updateUserById,
);
router.delete(
  "/:id",
  verifyUser,
  verifyRole(["admin"]),
  userIdValidation,
  deleteUserById,
);

export default router;
