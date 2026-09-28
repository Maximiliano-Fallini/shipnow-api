import { successResponse, createError } from "../utils/apiResponse.js";
import { generateMockUsers, generateMockCustomers, generateMockOwners } from "../mocks/user.mocks.js";
import { generateMockStores } from "../mocks/store.mocks.js";
import { generateMockOrders } from "../mocks/orders.mocks.js";
import { insertManyUsers } from "../repositories/user.repository.js";
import { insertManyStores } from "../repositories/store.repository.js";
import { insertManyOrders } from "../repositories/order.repositories.js";

const MAX = 100;
const DEFAULT_COUNT = 50;

const validateCount = (count, min = 1) => {
    if (typeof count !== "number" || Number.isNaN(count) || count < min || count > MAX) {
        throw createError("INVALID_MOCK_QUANTITY", `La cantidad debe ser un numero entre ${min} y ${MAX}`);
    }
};

export const getMockingUsers = (req, res) => {
    const count = Math.min(Number(req.query.count) || DEFAULT_COUNT, MAX);
    const users = generateMockUsers(count);

    successResponse(res, { statusCode: 200, message: "Usuarios simulados generados", payload: users });
};

export const getMockingOrders = (req, res) => {
    const count = Math.min(Number(req.query.count) || DEFAULT_COUNT, MAX);
    const orders = generateMockOrders(count, "64a0e7f8c1b9f3e5d6a7b8c9", "64a0e7f8c1b9f3e5d6a7b8d0");

    successResponse(res, { statusCode: 200, message: "Pedidos simulados generados", payload: orders });
};

export const createMockUser = async (req, res, next) => {
    try {
        const { role } = req.body;

        const [user] = await insertManyUsers(generateMockUsers(1, role));

        successResponse(res, { statusCode: 201, message: "Usuario mock creado", payload: { created: 1, user } });
    } catch (err) {
        next(err);
    }
};

export const createMockUsers = async (req, res, next) => {
    try {
        const { count = 1 } = req.body;
        validateCount(count);

        const users = await insertManyUsers(generateMockUsers(count));

        successResponse(res, { statusCode: 201, message: "Usuarios mock creados", payload: { created: users.length, users } });
    } catch (err) {
        next(err);
    }
};

export const createMockCustomers = async (req, res, next) => {
    try {
        const { count = 1 } = req.body;
        validateCount(count);

        const customers = await insertManyUsers(generateMockCustomers(count));

        successResponse(res, { statusCode: 201, message: "Clientes mock creados", payload: { created: customers.length, customers } });
    } catch (err) {
        next(err);
    }
};

export const createMockOwners = async (req, res, next) => {
    try {
        const { count = 1 } = req.body;
        validateCount(count);

        const owners = await insertManyUsers(generateMockOwners(count));

        const stores = generateMockStores(owners.length, owners[0]._id);
        const savedStores = await insertManyStores(stores);

        successResponse(res, {
            statusCode: 201,
            message: "Propietarios y comercios mock creados",
            payload: {
                created: { owners: owners.length, stores: savedStores.length },
                owners,
                stores: savedStores
            }
        });
    } catch (err) {
        next(err);
    }
};

export const createMockOrders = async (req, res, next) => {
    try {
        const { count = 1, customerId, storeId } = req.body;
        validateCount(count);

        if (!customerId || !storeId) {
            throw createError("VALIDATION_ERROR", "Faltan customerId y storeId");
        }

        const orders = await insertManyOrders(generateMockOrders(count, customerId, storeId));

        successResponse(res, { statusCode: 201, message: "Pedidos mock creados", payload: { created: orders.length, orders } });
    } catch (err) {
        next(err);
    }
};

export const generateData = async (req, res, next) => {
    try {
        const { users = 0, orders = 0 } = req.body;
        validateCount(users, 0);
        validateCount(orders, 0);

        const customers = users > 0 ? await insertManyUsers(generateMockCustomers(users)) : [];
        const owners = await insertManyUsers(generateMockOwners(1));
        const stores = await insertManyStores(generateMockStores(1, owners[0]._id));

        if (orders > 0 && customers.length === 0) {
            throw createError("VALIDATION_ERROR", "Se necesitan usuarios para generar pedidos");
        }

        const mockOrders = orders > 0
            ? await insertManyOrders(generateMockOrders(orders, customers[0]._id, stores[0]._id))
            : [];

        successResponse(res, {
            statusCode: 201,
            message: "Datos mock generados",
            payload: {
                created: {
                    users: customers.length,
                    owners: owners.length,
                    stores: stores.length,
                    orders: mockOrders.length
                },
                users: customers,
                owners,
                stores,
                orders: mockOrders
            }
        });
    } catch (err) {
        next(err);
    }
};
