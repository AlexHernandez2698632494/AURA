import express from 'express';
import multer from 'multer';
import {
  createBuilding,
  getAllBuildings,
  getBuildings,
  getImageById,
} from "../controllers/building.controller.js";
import { get } from 'http';

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
router.get("/building/", getAllBuildings);
router.get('/building/:id', getImageById);


export default router;
