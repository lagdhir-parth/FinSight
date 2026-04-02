import dotenv from "dotenv";
import ApiError from "../utils/apiError.js";

dotenv.config();

const requiredEnvVars = [
  "PORT",
  "MONGO_URI",
  "ALLOWED_ORIGINS",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "ACCESS_TOKEN_EXPIRY",
  "REFRESH_TOKEN_EXPIRY",
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new ApiError(
      500,
      `Missing required environment variable: ${varName}`,
    );
  }
});

if (isNaN(process.env.PORT)) {
  throw new ApiError(500, "❌ PORT must be a number");
}

const env = {
  PORT: process.env.PORT,
  MONGO_URI: process.env.MONGO_URI,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS.split(",") || [
    "http://localhost:5173",
  ],
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY,
};

export default env;
