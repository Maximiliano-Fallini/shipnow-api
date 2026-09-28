import { Router } from "express";
import {
    getMockingUsers,
    getMockingOrders,
    createMockUser,
    createMockUsers,
    createMockCustomers,
    createMockOwners,
    createMockOrders,
    generateData
} from "../controller/controller.mocks.js";

const router = Router();

router.get("/mockingusers", getMockingUsers);

router.get("/mockingorders", getMockingOrders);

router.post("/createMockUser", createMockUser);

router.post("/createMockUsers", createMockUsers);

router.post("/createMockCustomers", createMockCustomers);

router.post("/createMockOwners", createMockOwners);

router.post("/createMockOrders", createMockOrders);

router.post("/generateData", generateData);

export default router;
