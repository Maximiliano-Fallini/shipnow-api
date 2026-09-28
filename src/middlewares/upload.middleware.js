import multer from "multer";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "path";
import { createError } from "../utils/apiResponse.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve(process.cwd(), "uploads/documents");

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = ["application/pdf"];

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, UPLOAD_DIR);
    },
    filename: (req, file, callback) => {
        const extension = path.extname(file.originalname);
        const fileName = `${crypto.randomUUID()}${extension}`;

        callback(null, fileName);
    }
});

const fileFilter = (req, file, callback) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return callback(null, true);
    }

    callback(createError("INVALID_FILE_TYPE"));
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE_MB || 80) * 1024 * 1024
    }
});

export default upload;
