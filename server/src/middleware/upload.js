import multer from "multer";
import path from "path";
import crypto from "crypto";
import { AppError } from "./errorHandler.js";

const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf"];

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    const unique = crypto.randomBytes(8).toString("hex");
    cb(null, `${Date.now()}-${unique}${path.extname(file.originalname)}`);
  },
});

const uploader = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!allowed.includes(file.mimetype)) {
      return cb(new AppError(400, "INVALID_FILE_TYPE", "Only PNG, JPEG, WEBP or PDF allowed"));
    }
    cb(null, true);
  },
}).single("attachment");

export function upload(req, res, next) {
  uploader(req, res, (err) => {
    if (!err) return next();
    if (err.code === "LIMIT_FILE_SIZE") {
      return next(new AppError(413, "FILE_TOO_LARGE", "File must be under 5 MB"));
    }
    next(err);
  });
}