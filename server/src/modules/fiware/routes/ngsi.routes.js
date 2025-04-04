import express from "express";
import { getEntitiesWithAlerts, getServicePaths, sendDataToAgent } from "../controllers/ngsi.controller.js";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);
router.get("/services-path",getServicePaths);
router.post('/sendData', sendDataToAgent);

export default router;