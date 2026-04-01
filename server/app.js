import express from "express";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.ALLOWED_ORIGINS || "http://localhost:5173",
    credentials: true,
  }),
);

export default app;
