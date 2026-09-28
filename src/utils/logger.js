import winston from "winston";
import path from "node:path";
import fs from "node:fs";
import { envConfig } from "../config/env.js";

const logsDir = process.env.LOGS_DIR || path.resolve(process.cwd(), "logs");

fs.mkdirSync(logsDir, { recursive: true });

const logger = winston.createLogger({

    level: process.env.LOG_LEVEL || "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, "error.log"),
            level: "error"
        }),
        new winston.transports.File({
            filename: path.join(logsDir, "combined.log")
        })
    ]
});

if (!envConfig.isProd) {
    logger.add(new winston.transports.Console());
}

export default logger;