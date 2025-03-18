import swaggerUi from "swagger-ui-express";
import * as swaggerDocument from "../../swagger.json";
import { Express } from "express";

// Setup Swagger UI
const setupSwagger = (app: Express) => {
  app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
};

export default setupSwagger;
