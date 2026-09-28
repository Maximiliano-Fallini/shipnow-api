import { Router } from "express";
import { getUsers, getUserById, createUser, updateUser, deleteUser, uploadUserDocument } from "../controller/users.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getUsers);

router.get("/:uid", getUserById);

router.post("/", createUser);

router.put("/:uid", updateUser);

router.delete("/:uid", deleteUser);

router.post("/:uid/documents", upload.single("document"), uploadUserDocument);

export default router;
