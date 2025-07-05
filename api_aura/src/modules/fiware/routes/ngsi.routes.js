import express from "express";
import {
  createRule,
  deleteRule,
  FailedStatusGhost,
  getAllRules,
  getEntitiesWithAlerts,
  getRuleById,
  getRulesByServiceSubserviceActuatorAndCommand,
  getRulesByServiceSubserviceAndActuator,
  getRuleStats,
  getServicePaths,
  getSubServiceBranch,
  getSubServiceBuilding,
  getSubServiceBuildingAndBranch,
  sendDataToAgent,
  updateActuatorStatusController,
  updateRule,
  updateRuleCommand,
  updateRuleEnabled,
  updateRuleType
} from "../controllers/ngsi.controller.js";

const router = express.Router();

router.get("/entities", getEntitiesWithAlerts);
router.get("/services-path", getServicePaths);
router.get("/services-path/building", getSubServiceBuildingAndBranch);
router.get("/services-path/branch", getSubServiceBranch);
router.post("/sendData", sendDataToAgent);
router.post("/failed/ghost", FailedStatusGhost);
router.post("/update/actuator", updateActuatorStatusController);

router.get("/rules/actuator/:actuatorId", getRulesByServiceSubserviceAndActuator);
router.get("/rules/:actuatorId/:command", getRulesByServiceSubserviceActuatorAndCommand);
router.get("/rules/stats", getRuleStats);
router.get("/rules", getAllRules);
router.get("/rules/:id", getRuleById);
router.post("/rules", createRule);
router.patch("/rules/:id/enabled", updateRuleEnabled);
router.post("/rules/ruleType",updateRuleType);
router.post("/rules/ruleCommand", updateRuleCommand); 
router.put("/rules/:id", updateRule);
router.delete("/rules/:id", deleteRule);

export default router;
