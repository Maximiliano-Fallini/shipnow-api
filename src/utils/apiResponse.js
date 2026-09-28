import { ERROR_DICTIONARY } from "./errorDictionary.js";  

export function successResponse(res, { statusCode, message, payload }) {
    return res.status(statusCode).json({
        status: "success",
        message,
        payload
    });
}

export function errorResponse(res, { statusCode = 500, error, message = "Error interno en el servidor" }) {
    return res.status(statusCode).json({
        status: "error",
        error,
        message
    });
}

export function createError(code, customMessage = null) {
    const errorInfo = ERROR_DICTIONARY[code] || ERROR_DICTIONARY.INTERNAL_SERVER_ERROR;

    const error = new Error(customMessage || errorInfo.message);
    error.statusCode = errorInfo.statusCode;
    error.code = ERROR_DICTIONARY[code] ? code : "INTERNAL_SERVER_ERROR";

    return error;
}