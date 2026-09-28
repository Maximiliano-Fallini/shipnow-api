import StoreModel from "../models/store.model.js";

export const storeRepository = {

    findAll: async () => {
        return await StoreModel.find().limit(100);
    },

    findById: async (id) => {
        return await StoreModel.findById(id);
    },

    create: async (storeData) => {
        return await StoreModel.create(storeData);
    },

    updateById: async (id, storeData) => {
        return await StoreModel.findByIdAndUpdate(id, storeData, {
            new: true,
            runValidators: true
        });
    },

    deleteById: async (id) => {
        return await StoreModel.findByIdAndDelete(id);
    }
};

export const insertManyStores = async (stores) => {

    return await StoreModel.insertMany(stores);
};
