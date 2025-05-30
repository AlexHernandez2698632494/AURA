import express from "express";
import {
  createRule,
  deleteRule,
  getAllRules,
  getEntitiesWithAlerts,
  getRuleById,
  getRulesByServiceSubserviceActuatorAndCommand,
  getRulesByServiceSubserviceAndActuator,
  getServicePaths,
  getSubServiceBranch,
  getSubServiceBuilding,
  getSubServiceBuildingAndBranch,
  sendDataToAgent,
  updateActuatorStatusController,
  updateRule
} from "../controllers/ngsi.controller.js";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);
router.get("/services-path", getServicePaths);
router.get("/services-path/building", getSubServiceBuildingAndBranch);
router.get("/services-path/branch", getSubServiceBranch);
router.post("/sendData", sendDataToAgent);
router.post("/update/actuator", updateActuatorStatusController);

router.get("/rules/actuator/:actuatorId", getRulesByServiceSubserviceAndActuator);
router.get("/rules/:actuatorId/:command", getRulesByServiceSubserviceActuatorAndCommand);
router.post("/rules", createRule);
router.get("/rules", getAllRules);
router.get("/rules/:id", getRuleById);
router.put("/rules/:id", updateRule);
router.delete("/rules/:id", deleteRule);

export default router;
