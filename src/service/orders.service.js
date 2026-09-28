import { orderRepository } from "../repositories/order.repositories.js";
import { createError } from "../utils/apiResponse.js";
import { ORDER_STATUS } from "../constants/orderStatus.js";
import { DELIVERY_PRIORITY } from "../constants/deliveryPriority.js";

export const ordersService = {

    getOrders: async () => {
        return orderRepository.findAll();
    },

    getOrderById: async (id) => {
        const order = await orderRepository.findById(id);

        if (!order) {
            throw createError("ORDER_NOT_FOUND");
        }

        return order;
    },

    getOrderStatus: async (id) => {
        const order = await orderRepository.findById(id);

        if (!order) {
            throw createError("ORDER_NOT_FOUND");
        }

        return {
            _id: order._id,
            status: order.status,
            priority: order.priority,
            updatedAt: order.updatedAt
        };
    },

    createOrder: async (orderData) => {
        const { customer, store, items, deliveryAddress } = orderData;

        if (!customer || !store || !items || !deliveryAddress) {
            throw createError("VALIDATION_ERROR", "Faltan datos obligatorios");
        }

        const customerFound = await orderRepository.findCustomerById(customer);

        if (!customerFound) {
            throw createError("USER_NOT_FOUND");
        }

        const storeFound = await orderRepository.findStoreById(store);

        if (!storeFound) {
            throw createError("STORE_NOT_FOUND");
        }

        const total = items.reduce(
            (accumulator, item) => accumulator + item.price * item.quantity, 0);

        return orderRepository.create({
            ...orderData,
            total,
            status: ORDER_STATUS.CREATED,
            priority: orderData.priority || DELIVERY_PRIORITY.NORMAL
        });
    },

    updateOrderStatus: async (id, status) => {
        if (!Object.values(ORDER_STATUS).includes(status)) {
            throw createError("INVALID_STATUS");
        }

        const order = await orderRepository.updateStatusById(id, status);

        if (!order) {
            throw createError("ORDER_NOT_FOUND");
        }

        return order;
    },

    addOrderProof: async (id, file) => {
        if (!file) {
            throw createError("FILE_REQUIRED");
        }

        const order = await orderRepository.findById(id);

        if (!order) {
            throw createError("ORDER_NOT_FOUND");
        }

        const proof = {
            originalName: file.originalname,
            fileName: file.filename,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size
        };

        return orderRepository.addProofById(id, proof);
    },

    deleteOrder: async (id) => {
        const order = await orderRepository.deleteById(id);

        if (!order) {
            throw createError("ORDER_NOT_FOUND");
        }

        return order;
    }
};
