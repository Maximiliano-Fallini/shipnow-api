import { createError } from "../utils/apiResponse.js";

export function notFoundHandler(req, res, next) {
    next(createError("ROUTE_NOT_FOUND"));
}