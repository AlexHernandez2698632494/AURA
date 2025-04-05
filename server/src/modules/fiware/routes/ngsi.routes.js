import express from "express";
import { getEntitiesWithAlerts, getServicePaths, getSubServiceBranch, getSubServiceBuilding, sendDataToAgent } from "../controllers/ngsi.controller.js";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);
router.get("/services-path",getServicePaths);
router.get("/services-path/building",getSubServiceBuilding);
router.get("/services-path/branch",getSubServiceBranch);
router.post('/sendData', sendDataToAgent);

export default router;