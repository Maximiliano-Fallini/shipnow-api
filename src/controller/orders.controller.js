import { ordersService } from "../service/orders.service.js";
import { successResponse } from "../utils/apiResponse.js";
import fs from "fs";

export const getOrders = async (req, res, next) => {
    try {
        const payload = await ordersService.getOrders();
        successResponse(res, { statusCode: 200, message: "Pedidos obtenidos", payload });
    } catch (err) {
        next(err);
    }
};

export const getOrderById = async (req, res, next) => {
    try {
        const payload = await ordersService.getOrderById(req.params.oid);
        successResponse(res, { statusCode: 200, message: "Pedido obtenido", payload });
    } catch (err) {
        next(err);
    }
};

export const getOrderStatus = async (req, res, next) => {
    try {
        const payload = await ordersService.getOrderStatus(req.params.oid);
        successResponse(res, { statusCode: 200, message: "Estado del pedido obtenido", payload });
    } catch (err) {
        next(err);
    }
};

export const createOrder = async (req, res, next) => {
    try {
        const payload = await ordersService.createOrder(req.body);
        successResponse(res, { statusCode: 201, message: "Pedido creado", payload });
    } catch (err) {
        next(err);
    }
};

export const updateOrderStatus = async (req, res, next) => {
    try {
        const payload = await ordersService.updateOrderStatus(req.params.oid, req.body.status);
        successResponse(res, { statusCode: 200, message: "Estado del pedido actualizado", payload });
    } catch (err) {
        next(err);
    }
};

export const uploadOrderProof = async (req, res, next) => {
    try {
        const payload = await ordersService.addOrderProof(req.params.oid, req.file);

        return successResponse(res, { statusCode: 201, message: "Comprobante recibido correctamente", payload });
    } catch (error) {
        if (req.file) {
            await fs.promises.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
};

export const deleteOrder = async (req, res, next) => {
    try {
        const payload = await ordersService.deleteOrder(req.params.oid);
        successResponse(res, { statusCode: 200, message: "Pedido eliminado", payload });
    } catch (err) {
        next(err);
    }
};
