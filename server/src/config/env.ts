import dotenv from "dotenv";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  MONGODB_URI: process.env.MONGODB_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? "1h",
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  UPLOAD_DIR: process.env.UPLOAD_DIR ?? "uploads",
};