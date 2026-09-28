import { userService } from "../service/user.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import fs from "fs";

export const getUsers = async (req, res, next) => {
    try {
        const payload = await userService.getUsers();
        successResponse(res, { statusCode: 200, message: "Usuarios obtenidos", payload });
    } catch (err) {
        next(err);
    }
};

export const getUserById = async (req, res, next) => {
    try {
        const payload = await userService.getUserById(req.params.uid);
        successResponse(res, { statusCode: 200, message: "Usuario obtenido", payload });
    } catch (err) {
        next(err);
    }
};

export const createUser = async (req, res, next) => {
    try {
        const payload = await userService.createUser(req.body);
        successResponse(res, { statusCode: 201, message: "Usuario creado", payload });
    } catch (err) {
        next(err);
    }
};

export const updateUser = async (req, res, next) => {
    try {
        const payload = await userService.updateUser(req.params.uid, req.body);
        successResponse(res, { statusCode: 200, message: "Usuario actualizado", payload });
    } catch (err) {
        next(err);
    }
};

export const deleteUser = async (req, res, next) => {
    try {
        const payload = await userService.deleteUser(req.params.uid);
        successResponse(res, { statusCode: 200, message: "Usuario eliminado", payload });
    } catch (err) {
        next(err);
    }
};

export const uploadUserDocument = async (req, res, next) => {
    try {
        const { uid } = req.params;
        const { type } = req.body;
        const file = req.file;

        const user = await userService.addDocument(uid, file, type);

        return successResponse(res, {
            statusCode: 201,
            message: "Archivo recibido correctamente",
            payload: { user, file }
        });
    } catch (error) {
        if (req.file) {
            await fs.promises.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
}