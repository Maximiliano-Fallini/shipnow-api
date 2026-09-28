import UserModel from "../models/user.model.js";

export const insertManyUsers = async (users) => {

    return await UserModel.insertMany(users);

}

export const userRepository = {

    findAll: async () => {
        return await UserModel.find();
    },

    findById: async (id) => {
        return await UserModel.findById(id);
    },

    create: async (userData) => {
        return await UserModel.create(userData);
    },

    updateById: async (id, userData) => {
        return await UserModel.findByIdAndUpdate(id, userData, {
            new: true,
            runValidators: true
        });
    },

    deleteById: async (id) => {
        return await UserModel.findByIdAndDelete(id);
    }
};