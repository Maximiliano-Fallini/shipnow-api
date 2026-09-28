import { expect } from "chai";
import supertest from "supertest";
import fs from "node:fs";
import path from "node:path";
import app from "../src/app.js";
import { connectTestDB, clearTestDB, disconnectTestDB } from "./helpers/db.js";

const requester = supertest(app);

const validUser = {
    firstName: "Martina",
    lastName: "Gomez",
    email: "martina@test.com",
    password: "123456",
    role: "customer"
};

describe("Testing de usuarios (/api/users)", () => {

    before(async () => {
        await connectTestDB();
        await clearTestDB();
    });

    after(async () => {
        await clearTestDB();
        await disconnectTestDB();
    });

    it("Debe crear un usuario y responder 201", async () => {
        const response = await requester.post("/api/users").send(validUser);

        expect(response.status).to.equal(201);
        expect(response.body.status).to.equal("success");
        expect(response.body.payload._id).to.be.a("string");
        expect(response.body.payload.email).to.equal(validUser.email);
    });

    it("Debe responder 400 si faltan datos obligatorios", async () => {
        const response = await requester.post("/api/users").send({ firstName: "Solo nombre" });

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("Debe obtener la lista de usuarios", async () => {
        const response = await requester.get("/api/users");

        expect(response.status).to.equal(200);
        expect(response.body.payload).to.be.an("array");
        expect(response.body.payload).to.not.be.empty;
    });

    it("Debe obtener un usuario por id", async () => {
        const created = await requester.post("/api/users").send({ ...validUser, email: "porid@test.com" });

        const response = await requester.get(`/api/users/${created.body.payload._id}`);

        expect(response.status).to.equal(200);
        expect(response.body.payload._id).to.equal(created.body.payload._id);
    });

    it("Debe responder 404 si el usuario no existe", async () => {
        const response = await requester.get("/api/users/64a0e7f8c1b9f3e5d6a7b8c9");

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("USER_NOT_FOUND");
    });

    it("Debe responder 400 si el id es invalido", async () => {
        const response = await requester.get("/api/users/id-invalido");

        expect(response.status).to.equal(400);
        expect(response.body.error).to.equal("VALIDATION_ERROR");
    });

    it("Debe actualizar un usuario", async () => {
        const created = await requester.post("/api/users").send({ ...validUser, email: "actualizar@test.com" });

        const response = await requester.put(`/api/users/${created.body.payload._id}`).send({ firstName: "Actualizada" });

        expect(response.status).to.equal(200);
        expect(response.body.payload.firstName).to.equal("Actualizada");
    });

    it("Debe responder 404 al actualizar un usuario inexistente", async () => {
        const response = await requester.put("/api/users/64a0e7f8c1b9f3e5d6a7b8c9").send({ firstName: "Nadie" });

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("USER_NOT_FOUND");
    });

    it("Debe eliminar un usuario", async () => {
        const created = await requester.post("/api/users").send({ ...validUser, email: "eliminar@test.com" });

        const response = await requester.delete(`/api/users/${created.body.payload._id}`);

        expect(response.status).to.equal(200);
        expect(response.body.payload._id).to.equal(created.body.payload._id);
    });

    it("Debe responder 404 al eliminar un usuario inexistente", async () => {
        const response = await requester.delete("/api/users/64a0e7f8c1b9f3e5d6a7b8c9");

        expect(response.status).to.equal(404);
        expect(response.body.error).to.equal("USER_NOT_FOUND");
    });

    describe("Carga de documentos de usuario", () => {

        let userId = null;
        let uploadedPath = null;

        before(async () => {
            const created = await requester.post("/api/users").send({ ...validUser, email: "documentos@test.com" });
            userId = created.body.payload._id;
        });

        after(() => {
            if (uploadedPath && fs.existsSync(uploadedPath)) {
                fs.rmSync(uploadedPath);
            }
        });

        it("Debe subir un PDF y guardar los metadatos en la base", async () => {
            const response = await requester
                .post(`/api/users/${userId}/documents`)
                .field("type", "user_document")
                .attach("document", Buffer.from("%PDF-1.4 documento de prueba"), "documento.pdf");

            expect(response.status).to.equal(201);
            expect(response.body.payload.file.filename).to.be.a("string");
            expect(response.body.payload.user.documents).to.have.lengthOf(1);
            expect(response.body.payload.user.documents[0].mimeType).to.equal("application/pdf");

            uploadedPath = path.resolve(response.body.payload.file.path);
        });

        it("Debe responder 400 si no se adjunta archivo", async () => {
            const response = await requester
                .post(`/api/users/${userId}/documents`)
                .field("type", "user_document");

            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal("FILE_REQUIRED");
        });

        it("Debe responder 400 si el archivo no es PDF", async () => {
            const response = await requester
                .post(`/api/users/${userId}/documents`)
                .field("type", "user_document")
                .attach("document", Buffer.from("no soy un pdf"), "documento.txt");

            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal("INVALID_FILE_TYPE");
        });

        it("Debe responder 400 si el tipo de documento es invalido", async () => {
            const response = await requester
                .post(`/api/users/${userId}/documents`)
                .field("type", "tipo-inexistente")
                .attach("document", Buffer.from("%PDF-1.4 documento de prueba"), "documento2.pdf");

            expect(response.status).to.equal(400);
            expect(response.body.error).to.equal("INVALID_DOCUMENT_TYPE");
        });
    });
});