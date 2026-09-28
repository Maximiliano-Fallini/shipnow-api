import { Router } from "express";
import { generateLogs } from "../controller/logger.controller.js";

const router = Router();

router.get("/", generateLogs);

export default router;
