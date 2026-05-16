import "express-async-errors";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { env } from "./config/env";
import { registerRoutes } from "./routes";
import { errorHandler } from "./middleware/errorHandler";
import { uploadDir } from "./utils/upload";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(morgan("dev"));
app.use("/uploads", express.static(uploadDir));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "lms-server" });
});

registerRoutes(app);

app.use(errorHandler);

export default app;