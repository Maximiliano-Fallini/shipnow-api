import { errorResponse } from "../utils/apiResponse.js";
import { ERROR_DICTIONARY } from "../utils/errorDictionary.js";
import logger from "../utils/logger.js";

export function errorHandler(error, req, res, next) {
    let statusCode = error.statusCode || 500;
    let code = error.code || "INTERNAL_SERVER_ERROR";
    let message = error.message;

    // Errores propios de Multer (ej: archivo que supera el limite permitido)
    if (error.name === "MulterError") {
        code = error.code === "LIMIT_FILE_SIZE" ? "INVALID_TOO_LARGE" : "VALIDATION_ERROR";
        statusCode = ERROR_DICTIONARY[code].statusCode;
        message = ERROR_DICTIONARY[code].message;
    }

    // Errores de Mongoose (id invalido o datos que no cumplen el schema)
    if (error.name === "CastError" || error.name === "ValidationError") {
        code = "VALIDATION_ERROR";
        statusCode = ERROR_DICTIONARY[code].statusCode;
        message = ERROR_DICTIONARY[code].message;
    }

    if (statusCode >= 500) {
        logger.error(`${req.method} ${req.originalUrl} -> ${message}`);
    }

    return errorResponse(res, { statusCode, error: code, message });
}