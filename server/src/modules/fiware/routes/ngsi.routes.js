import express from "express";
import { getEntitiesWithAlerts, getSubService, sendDataToAgent } from "../controllers/ngsi.controller.js";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);
router.get("/services-path",getSubService);
router.post('/sendData', sendDataToAgent);

export default router;