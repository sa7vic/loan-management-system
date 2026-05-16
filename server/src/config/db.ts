import mongoose from "mongoose";
import { env } from "./env";

export async function connectDb() {
  if (!env.MONGODB_URI) {
    throw new Error("MONGODB_URI is missing in environment");
  }
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
}

export async function disconnectDb() {
  await mongoose.disconnect();
}