export const ERROR_DICTIONARY = {
    VALIDATION_ERROR: {
        statusCode: 400,
        message: "Datos invalidos o incompletos"
    },

    USER_NOT_FOUND: {
        statusCode: 404,
        message: "Usuario no encontrado"
    },

    INVALID_USER_ROLE: {
        statusCode: 400,
        message: "Rol de usuario no válido"
    },

    ORDER_NOT_FOUND: {
        statusCode: 404,
        message: "Pedido no encontrado"
    },

    STORE_NOT_FOUND: {
        statusCode: 404,
        message: "Comercio no encontrado"
    },

    INVALID_STATUS: {
        statusCode: 400,
        message: "Estado inválido"
    },

    INVALID_MOCK_QUANTITY: {
        statusCode: 400,
        message: "Cantidad inválida de mocks"
    },

    ROUTE_NOT_FOUND: {
        statusCode: 404,
        message: "Ruta no encontrada"
    },

    INTERNAL_SERVER_ERROR: {
        statusCode: 500,
        message: "Error interno del servidor"
    },

    FILE_REQUIRED: {
        statusCode: 400,
        message: "Debe adjuntar un archivo"
    },

    INVALID_DOCUMENT_TYPE: {
        statusCode: 400,
        message: "Tipo de documento invalido"
    },

    INVALID_FILE_TYPE: {
        statusCode: 400,
        message: "Tipo de archivo no permitido"
    },

    INVALID_TOO_LARGE: {
        statusCode: 413,
        message: "El archivo supera el tamaño maximo permitido"
    }

}