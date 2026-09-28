import { storeRepository } from "../repositories/store.repository.js";
import { createError } from "../utils/apiResponse.js";

export const storeService = {

    getStores: async () => {
        return storeRepository.findAll();
    },

    getStoreById: async (id) => {
        const store = await storeRepository.findById(id);

        if (!store) {
            throw createError("STORE_NOT_FOUND");
        }

        return store;
    },

    createStore: async (storeData) => {
        const { name, address, owner } = storeData;

        if (!name || !address || !owner) {
            throw createError("VALIDATION_ERROR", "Nombre, direccion y owner son obligatorios");
        }

        return storeRepository.create(storeData);
    },

    updateStore: async (id, storeData) => {
        const store = await storeRepository.updateById(id, storeData);

        if (!store) {
            throw createError("STORE_NOT_FOUND");
        }

        return store;
    },

    deleteStore: async (id) => {
        const store = await storeRepository.deleteById(id);

        if (!store) {
            throw createError("STORE_NOT_FOUND");
        }

        return store;
    }
};
