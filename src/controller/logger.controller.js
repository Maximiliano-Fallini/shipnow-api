import logger from "../utils/logger.js";
import { successResponse } from "../utils/apiResponse.js";

export const generateLogs = (req, res) => {
    logger.debug("Log de prueba - nivel debug");
    logger.http("Log de prueba - nivel http");
    logger.info("Log de prueba - nivel info");
    logger.warn("Log de prueba - nivel warn");
    logger.error("Log de prueba - nivel error");

    successResponse(res, {
        statusCode: 200,
        message: "Logs de prueba generados (ver logs/combined.log y logs/error.log)",
        payload: { levels: ["debug", "http", "info", "warn", "error"], logLevel: process.env.LOG_LEVEL || "info" }
    });
};
