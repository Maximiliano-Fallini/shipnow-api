import OrderModel from "../models/order.model.js";
import UserModel from "../models/user.model.js";
import StoreModel from "../models/store.model.js";

export const orderRepository = {

    findAll: async () => {
        return await OrderModel.find().populate("customer").populate("store").limit(100);
    },

    findById: async (id) => {
        return await OrderModel.findById(id);
    },

    create: async (orderData) => {
        return await OrderModel.create(orderData);
    },

    updateStatusById: async (id, status) => {
        return await OrderModel.findByIdAndUpdate(id, { status }, {
            new: true,
            runValidators: true
        });
    },

    addProofById: async (id, proof) => {
        return await OrderModel.findByIdAndUpdate(id, { proof }, {
            new: true,
            runValidators: true
        });
    },

    deleteById: async (id) => {
        return await OrderModel.findByIdAndDelete(id);
    },

    findCustomerById: async (customerId) => {
        return await UserModel.findById(customerId);
    },

    findStoreById: async (id) => {
        return await StoreModel.findById(id);
    }
};

export const insertManyOrders = async (orders) => {

    return await OrderModel.insertMany(orders);
};
