import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";

const requester = supertest(app);

describe("Testing de health check, Swagger y rutas inexistentes", () => {

    it("GET /health debe responder 200", async () => {
        const response = await requester.get("/health");

        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
    });

    it("GET /api/docs/ debe servir la interfaz de Swagger", async () => {
        const response = await requester.get("/api/docs/");

        expect(response.status).to.equal(200);
    });

    it("La documentacion de Swagger debe incluir los endpoints principales", async () => {
        const response = await requester.get("/api/docs/swagger-ui-init.js");

        expect(response.status).to.equal(200);
        expect(response.text).to.include("/api/users");
        expect(response.text).to.include("/api/stores");
        expect(response.text).to.include("/api/orders");
        expect(response.text).to.include("/api/mocks");
        expect(response.text).to.include("/api/logger");
        expect(response.text).to.include("proof");
    });

    it("Debe responder 404 con formato estandar en una ruta inexistente", async () => {
        const response = await requester.get("/api/ruta-que-no-existe");

        expect(response.status).to.equal(404);
        expect(response.body).to.have.property("status", "error");
        expect(response.body.error).to.equal("ROUTE_NOT_FOUND");
    });
});
