import express from "express";
import cors from "cors";
import env from "./src/config/env.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import compression from "compression";

const app = express();

app.use(compression()); // to compress response bodies for all request that traverse through the middleware

app.get("/health", (_, res) => {
  res.status(200).json({
    status: "ok",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  }),
);

app.use(helmet());

app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));

// Routes
import userRoutes from "./src/routes/user.routes.js";
import recordRoutes from "./src/routes/record.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import dashboardRoutes from "./src/routes/dashboard.routes.js";

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err.stack || err.message);

  if (err?.type === "entity.too.large" || err?.status === 413) {
    return res.status(413).json({
      success: false,
      message: "Voice payload is too large. Please record a shorter command.",
    });
  }

  // ✅ Handle your ApiError
  if (err.name === "ApiError") {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors || [],
      ...(err.data && { data: err.data }),
    });
  }

  // ✅ Handle validation errors (if using express-validator)
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message:
        err.message ||
        "Validation failed. Required fields might be missing or incorrect.",
      errors: err.errors,
    });
  }

  // ✅ Handle Mongoose errors
  if (err.name === "MongoError" || err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Duplicate field value entered",
    });
  }

  // Generic server errors
  res.status(500).json({
    success: false,
    message: "Something went wrong! Please try again later.",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

export default app;
