import { expect } from "chai";
import supertest from "supertest";
import fs from "node:fs";
import path from "node:path";
import app from "../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./helpers/db.js";

const requester = supertest(app);

describe("Testing de pedidos (/api/orders)", () => {

    let customerId = null;
    let storeId = null;
    let orderId = null;
    let proofPath = null;

    before(async () => {
        await connectTestDB();
        await clearTestDB();

        const customer = await requester.post("/api/users").send({
            firstName: "Cliente",
            lastName: "Test",
            email: "cliente.pedidos@test.com",
            password: "123456",
            role: "customer"
        });
        customerId = customer.body.payload._id;

        const owner = await requester.post("/api/users").send({
            firstName: "Duenio",
            lastName: "Test",
            email: "duenio.pedidos@test.com",
            password: "123456",
            role: "store"
        });

        const store = await requester.post("/api/stores").send({
            name: "Kiosco Centro",
            address: "Av. Siempre Viva 742",
            owner: owner.body.payload._id
        });
        storeId = store.body.payload._id;
    });

    after(async () => {
        if (proofPath && fs.existsSync(proofPath)) {
            fs.rmSync(proofPath);
        }
        await clearTestDB();
        await disconnectTestDB();
    });

    it("Debe crear un pedido calculando el total y con estado created", async () => {
        const response = await requester.post("/api/orders").send({
            customer: customerId,
            store: storeId,
            deliveryAddress: "Av. Siempre Viva 742",
            items: [
                { name: "Caja mediana", quantity: 2, price: 1500 },
                { name: "Sobre chico", quantity: 1, price: 800 }
            ]
        });

        expect(response.status).to.equal(201);
        expect(response.body.payload.total).to.equal(3800);
        expect(response.body.payload.status).to.equal("created");

        orderId = response.body.payload._id;
    });

    it("Debe responder 400 si faltan datos obligatorios", async () => {
        const response = await requester.post("/api/orders").send({ customer: customerId });

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("Debe responder 404 si el cliente no existe", async () => {
        const response = await requester.post("/api/orders").send({
            customer: "64a0e7f8c1b9f3e5d6a7b8c9",
            store: storeId,
            deliveryAddress: "Calle 1",
            items: [{ name: "Caja", quantity: 1, price: 100 }]
        });

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("USER_NOT_FOUND");
    });

    it("Debe responder 404 si el comercio no existe", async () => {
        const response = await requester.post("/api/orders").send({
            customer: customerId,
            store: "64a0e7f8c1b9f3e5d6a7b8c9",
            deliveryAddress: "Calle 1",
            items: [{ name: "Caja", quantity: 1, price: 100 }]
        });

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("STORE_NOT_FOUND");
    });

    it("Debe obtener el pedido por id", async () => {
        const response = await requester.get(`/api/orders/${orderId}`);

        expect(response.status).to.equal(200);
        expect(response.body.payload._id).to.equal(orderId);
    });

    it("Debe responder 404 si el pedido no existe", async () => {
        const response = await requester.get("/api/orders/64a0e7f8c1b9f3e5d6a7b8c9");

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("ORDER_NOT_FOUND");
    });

    it("Debe devolver el estado del pedido (tracking)", async () => {
        const response = await requester.get(`/api/orders/${orderId}/status`);

        expect(response.status).to.equal(200);
        expect(response.body.payload.status).to.equal("created");
    });

    it("Debe actualizar el estado del pedido", async () => {
        const response = await requester.put(`/api/orders/${orderId}/status`).send({ status: "in_transit" });

        expect(response.status).to.equal(200);
        expect(response.body.payload.status).to.equal("in_transit");
    });

    it("Debe responder 400 si el estado es invalido", async () => {
        const response = await requester.put(`/api/orders/${orderId}/status`).send({ status: "volando" });

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("INVALID_STATUS");
    });

    it("Debe subir el comprobante del pedido", async () => {
        const response = await requester
            .post(`/api/orders/${orderId}/proof`)
            .attach("proof", Buffer.from("%PDF-1.4 comprobante de entrega"), "comprobante.pdf");

        expect(response.status).to.equal(201);
        expect(response.body.payload.proof.fileName).to.be.a("string");
        expect(response.body.payload.proof.mimeType).to.equal("application/pdf");

        proofPath = path.resolve(response.body.payload.proof.path);
    });

    it("Debe responder 400 si el comprobante no es PDF", async () => {
        const response = await requester
            .post(`/api/orders/${orderId}/proof`)
            .attach("proof", Buffer.from("no soy un pdf"), "comprobante.txt");

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("INVALID_FILE_TYPE");
    });

    it("Debe responder 400 si no se adjunta comprobante", async () => {
        const response = await requester.post(`/api/orders/${orderId}/proof`);

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("FILE_REQUIRED");
    });

    it("Debe eliminar el pedido", async () => {
        const response = await requester.delete(`/api/orders/${orderId}`);

        expect(response.status).to.equal(200);
        expect(response.body.payload._id).to.equal(orderId);
    });

    it("Debe responder 404 al eliminar un pedido inexistente", async () => {
        const response = await requester.delete("/api/orders/64a0e7f8c1b9f3e5d6a7b8c9");

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("ORDER_NOT_FOUND");
    });
});