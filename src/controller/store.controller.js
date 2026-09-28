import { storeService } from "../service/store.service.js";
import { successResponse } from "../utils/apiResponse.js";

export const getStores = async (req, res, next) => {
    try {
        const payload = await storeService.getStores();
        successResponse(res, { statusCode: 200, message: "Comercios obtenidos", payload });
    } catch (err) {
        next(err);
    }
};

export const getStoreById = async (req, res, next) => {
    try {
        const payload = await storeService.getStoreById(req.params.sid);
        successResponse(res, { statusCode: 200, message: "Comercio obtenido", payload });
    } catch (err) {
        next(err);
    }
};

export const createStore = async (req, res, next) => {
    try {
        const payload = await storeService.createStore(req.body);
        successResponse(res, { statusCode: 201, message: "Comercio creado", payload });
    } catch (err) {
        next(err);
    }
};

export const updateStore = async (req, res, next) => {
    try {
        const payload = await storeService.updateStore(req.params.sid, req.body);
        successResponse(res, { statusCode: 200, message: "Comercio actualizado", payload });
    } catch (err) {
        next(err);
    }
};

export const deleteStore = async (req, res, next) => {
    try {
        const payload = await storeService.deleteStore(req.params.sid);
        successResponse(res, { statusCode: 200, message: "Comercio eliminado", payload });
    } catch (err) {
        next(err);
    }
};
