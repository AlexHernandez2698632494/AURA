import express from 'express';
import multer from 'multer';
import {
  createBuilding,
  getBuildings,
} from "../controllers/building.controller.js";

// Configuración de multer
const upload = multer({
  storage: multer.memoryStorage(), // Usar almacenamiento en memoria
  limits: { fields: 10, files: 20, parts: 30 } // Limitar la cantidad de campos y archivos
});

const router = express.Router();

// Ruta para crear un edificio con imágenes
router.post("/building", upload.fields([{ name: 'mainImage' }, { name: 'imageForPlant' }]), createBuilding);

// Ruta para obtener edificios
router.get("/building", getBuildings);


export default router;
