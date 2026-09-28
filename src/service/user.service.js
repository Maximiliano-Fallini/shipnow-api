import { userRepository } from "../repositories/user.repository.js";
import { createError } from "../utils/apiResponse.js";
import { DOCUMENTS_TYPES } from "../constants/documentTypes.js";

export const userService = {

    getUsers: async () => {
        return userRepository.findAll();
    },

    getUserById: async (id) => {
        const user = await userRepository.findById(id);

        if (!user) {
            throw createError("USER_NOT_FOUND");
        }

        return user;
    },

    createUser: async (userData) => {
        const { firstName, lastName, email, password } = userData;

        if (!firstName || !lastName || !email || !password) {
            throw createError("VALIDATION_ERROR");
        }

        return userRepository.create(userData);
    },

    updateUser: async (id, userData) => {
        const user = await userRepository.updateById(id, userData);

        if (!user) {
            throw createError("USER_NOT_FOUND");
        }

        return user;
    },

    deleteUser: async (id) => {
        const user = await userRepository.deleteById(id);
        if (!user) {
            throw createError("USER_NOT_FOUND");
        }
        return user;
    },

    addDocument: async (id, file, type) => {
        if (!file){
            throw createError("FILE_REQUIRED")
        }

        if (Object.values(DOCUMENTS_TYPES).includes(type) === false){
            throw createError("INVALID_DOCUMENT_TYPE")
        }

        const user = await userRepository.findById(id);
        if(!user){
            throw createError("USER_NOT_FOUND")
        }

        const document = {
            originalName: file.originalname,
            fileName: file.filename,
            path: file.path,
            mimeType: file.mimetype,
            size: file.size,
            type
        };

        const documents = [...user.documents, document];

        return userRepository.updateById(id, { documents });
    }
}; 
