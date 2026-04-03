import { Router } from "express";
import { dashboardStats } from "../controllers/dashboard.controller.js";
import verifyUser from "../middlewares/verifyUser.middleware.js";

const router = Router();

router.get("/stats", verifyUser, dashboardStats);

export default router;
