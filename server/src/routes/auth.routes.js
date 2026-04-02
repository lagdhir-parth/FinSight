import { Router } from "express";
import verifyUser from "../middlewares/verifyUser.middleware.js";
import {
  registerUser,
  getCurrentUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
} from "../controllers/auth.controller.js";
import {
  registerUserValidation,
  loginUserValidation,
  refreshTokenValidation,
} from "../validations/authRequest.js";

const router = Router();

router.post("/register", registerUserValidation, registerUser);
router.post("/login", loginUserValidation, loginUser);
router.post("/logout", verifyUser, logoutUser);
router.post(
  "/refresh-access-token",
  refreshTokenValidation,
  refreshAccessToken,
);
router.get("/me", verifyUser, getCurrentUser);

export default router;
