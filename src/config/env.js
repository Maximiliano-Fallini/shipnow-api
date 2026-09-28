import dotenv from "dotenv";

dotenv.config();

export const envConfig = {
    PORT: process.env.PORT || 8080,
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/shipnow",
    nodeEnv: process.env.NODE_ENV || "development",
    isProd: process.env.NODE_ENV === "production",
    logLevel: process.env.LOG_LEVEL || "info",
    uploadDir: process.env.UPLOAD_DIR || "uploads/documents",
    maxFileSizeMb: Number(process.env.MAX_FILE_SIZE_MB || 80),
}