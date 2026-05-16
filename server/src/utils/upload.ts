import path from "path";
import fs from "fs";
import crypto from "crypto";
import multer from "multer";
import { env } from "../config/env";
import { HttpError } from "./http";

export const uploadDir = path.resolve(process.cwd(), env.UPLOAD_DIR);

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".bin";
    const name = crypto.randomUUID();
    cb(null, `${name}${ext.toLowerCase()}`);
  },
});

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);

function fileFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  if (!allowedTypes.has(file.mimetype)) {
    return cb(new HttpError(400, "Invalid file type. Upload PDF, JPG, or PNG."));
  }
  return cb(null, true);
}

export const salarySlipUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
