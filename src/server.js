import "dotenv/config";
import app from "./app.js";
import connectDB from "./config/db.js";
import { envConfig } from "./config/env.js";
import logger from "./utils/logger.js";

const PORT = envConfig.PORT;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      logger.info(`Servidor escuchando en el puerto ${PORT}`);
    });
  } catch (error) {
    logger.error(`Error al iniciar el servidor: ${error.message}`);
    process.exit(1);
  }
};

startServer();
