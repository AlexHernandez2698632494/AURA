import express from "express";
import {
  createBuilding,
  getBuildings,
} from "../controllers/building.controller.js";
const router = express.Router();

router.post("/building", createBuilding);
router.get("/building", getBuildings);
export default router;