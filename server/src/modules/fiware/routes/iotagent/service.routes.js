import express from "express";
import { createService } from "../../controllers/iotagent/service.controller.js";

const router = express.Router();

router.post("/service", createService);

export default router;