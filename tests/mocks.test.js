import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./helpers/db.js";

const requester = supertest(app);

describe("Testing del modulo Mocking (/api/mocks)", () => {

    before(async () => {
        await connectTestDB();
        await clearTestDB();
    });

    after(async () => {
        await clearTestDB();
        await disconnectTestDB();
    });

    it("Debe obtener correctamente los usuarios simulados", async () => {
        const response = await requester.get("/api/mocks/mockingusers");

        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload).to.be.an("array");
        expect(response.body.payload).to.not.be.empty;
    });

    it("Debe respetar el parametro count en usuarios simulados", async () => {
        const response = await requester.get("/api/mocks/mockingusers?count=3");

        expect(response.status).to.equal(200);
        expect(response.body.payload).to.have.lengthOf(3);
    });

    it("Debe obtener pedidos simulados con store, items y total", async () => {
        const response = await requester.get("/api/mocks/mockingorders");

        expect(response.status).to.equal(200);
        expect(response.body.payload).to.be.an("array");
        expect(response.body.payload).to.not.be.empty;

        response.body.payload.forEach(order => {
            expect(order).to.have.property("store");
            expect(order).to.have.property("items");
            expect(order).to.have.property("total");
        });
    });

    it("Debe crear usuarios mock en la base de datos", async () => {
        const response = await requester.post("/api/mocks/createMockUsers").send({ count: 3 });

        expect(response.status).to.equal(201);
        expect(response.body.payload.created).to.equal(3);
    });

    it("Debe crear un usuario mock con el rol indicado", async () => {
        const response = await requester.post("/api/mocks/createMockUser").send({ role: "customer" });

        expect(response.status).to.equal(201);
        expect(response.body.payload.user.role).to.equal("customer");
    });

    it("Debe responder 400 si la cantidad de mocks es invalida", async () => {
        const response = await requester.post("/api/mocks/createMockUsers").send({ count: 999 });

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("INVALID_MOCK_QUANTITY");
    });

    it("Debe responder 400 si la cantidad de mocks no es un numero", async () => {
        const response = await requester.post("/api/mocks/createMockUsers").send({ count: "muchos" });

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("INVALID_MOCK_QUANTITY");
    });

    it("Debe responder 400 si faltan customerId y storeId en pedidos mock", async () => {
        const response = await requester.post("/api/mocks/createMockOrders").send({ count: 1 });

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("Debe generar datos completos con generateData", async () => {
        const response = await requester.post("/api/mocks/generateData").send({ users: 2, orders: 2 });

        expect(response.status).to.equal(201);
        expect(response.body.payload.created.users).to.equal(2);
        expect(response.body.payload.created.orders).to.equal(2);
    });
});
