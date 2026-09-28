import { Router } from "express";
import {
    getOrders,
    getOrderById,
    getOrderStatus,
    createOrder,
    updateOrderStatus,
    uploadOrderProof,
    deleteOrder
} from "../controller/orders.controller.js";
import upload from "../middlewares/upload.middleware.js";

const router = Router();

router.get("/", getOrders);

router.get("/:oid", getOrderById);

router.get("/:oid/status", getOrderStatus);

router.post("/", createOrder);

router.put("/:oid/status", updateOrderStatus);

router.post("/:oid/proof", upload.single("proof"), uploadOrderProof);

router.delete("/:oid", deleteOrder);

export default router;
