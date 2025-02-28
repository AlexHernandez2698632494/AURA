import express from "express";
import { getEntitiesWithAlerts } from "../controllers/ngsi.controller.js";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);

export default router;