import express from "express";
import { createBuilding, getBuildings } from "../controllers/building.controller.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Rutas de edificios
router.post("/building", upload.single("imagenPrincipal"), createBuilding);
router.get("/building", getBuildings);

export default router;
