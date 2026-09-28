import { expect } from "chai";
import supertest from "supertest";
import app from "../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./helpers/db.js";

const requester = supertest(app);

describe("Testing de comercios (/api/stores)", () => {

    let ownerId = null;

    before(async () => {
        await connectTestDB();
        await clearTestDB();

        const owner = await requester.post("/api/users").send({
            firstName: "Duenio",
            lastName: "Test",
            email: "duenio@test.com",
            password: "123456",
            role: "store"
        });

        ownerId = owner.body.payload._id;
    });

    after(async () => {
        await clearTestDB();
        await disconnectTestDB();
    });

    it("Debe crear un comercio y responder 201", async () => {
        const response = await requester.post("/api/stores").send({
            name: "Kiosco Centro",
            address: "Av. Siempre Viva 742",
            owner: ownerId
        });

        expect(response.status).to.equal(201);
        expect(response.body.payload.name).to.equal("Kiosco Centro");
    });

    it("Debe responder 400 si faltan datos obligatorios", async () => {
        const response = await requester.post("/api/stores").send({ name: "Sin direccion" });

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("Debe obtener la lista de comercios", async () => {
        const response = await requester.get("/api/stores");

        expect(response.status).to.equal(200);
        expect(response.body.payload).to.be.an("array");
        expect(response.body.payload).to.not.be.empty;
    });

    it("Debe obtener un comercio por id", async () => {
        const created = await requester.post("/api/stores").send({
            name: "Kiosco Norte",
            address: "Calle 123",
            owner: ownerId
        });

        const response = await requester.get(`/api/stores/${created.body.payload._id}`);

        expect(response.status).to.equal(200);
        expect(response.body.payload._id).to.equal(created.body.payload._id);
    });

    it("Debe responder 404 si el comercio no existe", async () => {
        const response = await requester.get("/api/stores/64a0e7f8c1b9f3e5d6a7b8c9");

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("STORE_NOT_FOUND");
    });

    it("Debe actualizar un comercio", async () => {
        const created = await requester.post("/api/stores").send({
            name: "Kiosco Sur",
            address: "Calle 456",
            owner: ownerId
        });

        const response = await requester.put(`/api/stores/${created.body.payload._id}`).send({ name: "Kiosco Sur Actualizado" });

        expect(response.status).to.equal(200);
        expect(response.body.payload.name).to.equal("Kiosco Sur Actualizado");
    });

    it("Debe responder 404 al actualizar un comercio inexistente", async () => {
        const response = await requester.put("/api/stores/64a0e7f8c1b9f3e5d6a7b8c9").send({ name: "Nadie" });

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("STORE_NOT_FOUND");
    });

    it("Debe eliminar un comercio", async () => {
        const created = await requester.post("/api/stores").send({
            name: "Kiosco Oeste",
            address: "Calle 789",
            owner: ownerId
        });

        const response = await requester.delete(`/api/stores/${created.body.payload._id}`);

        expect(response.status).to.equal(200);
        expect(response.body.payload._id).to.equal(created.body.payload._id);
    });

    it("Debe responder 404 al eliminar un comercio inexistente", async () => {
        const response = await requester.delete("/api/stores/64a0e7f8c1b9f3e5d6a7b8c9");

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("STORE_NOT_FOUND");
    });
});
