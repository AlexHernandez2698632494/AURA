import express from "express";
import { getEntitiesWithAlerts, getSubService } from "../controllers/ngsi.controller.js";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);
router.get("/services-path",getSubService);

export default router;