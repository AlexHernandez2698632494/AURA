import express from "express";
import { getEntitiesWithAlerts, getServicePaths, getSubServiceBranch, getSubServiceBuilding, getSubServiceBuildingAndBranch, sendDataToAgent } from "../controllers/ngsi.controller.js";
import { get } from "mongoose";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);
router.get("/services-path",getServicePaths);
router.get("/services-path/building",getSubServiceBuildingAndBranch);
router.get("/services-path/branch",getSubServiceBranch);
router.post('/sendData', sendDataToAgent);

export default router;