import express from "express";
import {
  cleanSlateAlert,
  createAlert,
  deleteAlert,
  getAlerts,
  getMapping,
  restoreAlert,
  updateAlert,
} from "../controllers/Alert.controller.js";

const router = express.Router();

router.get("/alert", getAlerts);
router.get("/alerts/mappings", getMapping);
router.post("/alert", createAlert);
router.put("/alert/:id", updateAlert);
router.patch("/alert/:id", deleteAlert);
router.delete("/permanentAlert/:id", cleanSlateAlert);
router.patch("/restoreAlert/:id", restoreAlert);

export default router;