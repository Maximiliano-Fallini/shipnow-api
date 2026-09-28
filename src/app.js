import express from "express";
import cors from "cors";
import usersRouter from "./routes/users.router.js";
import storesRouter from "./routes/stores.router.js";
import ordersRouter from "./routes/orders.router.js";
import mocksRouter from "./routes/router.mocks.js";
import loggerRouter from "./routes/logger.router.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { notFoundHandler } from "./middlewares/notFoundHandler.js";
import { swaggerSpec } from "./docs/swagger.config.js";
import swaggerUI from "swagger-ui-express"

const app = express();

//Middlewares
app.use(cors());
app.use(express.json({ limit: "1mb" }));

//Routes
app.get("/", (req, res) => {
  res.json({
    status: "success",
    message: "ShipNow API"
  });
});


app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "API funcionando"
  });
});



app.use("/api/users", usersRouter);
app.use("/api/stores", storesRouter);
app.use("/api/orders", ordersRouter);

//Protección de rutas de mocking en entornos de desarrollo
if (process.env.NODE_ENV !== "production") {
  app.use("/api/mocks", mocksRouter);
  app.use("/api/logger", loggerRouter);
}

app.use("/api/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

//middlewares de errores
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
