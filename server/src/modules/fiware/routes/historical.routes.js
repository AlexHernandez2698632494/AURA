import express from "express";
import { getSensorHistorical } from "../controllers/historical.controller.js";

const router = express.Router();

router.get('/historical/:entityId/:attrName', getSensorHistorical);

export default router