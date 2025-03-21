import express from 'express';
import multer from 'multer';
import {
  createBuilding,
  getBuildings,
  getImageById,
} from "../controllers/building.controller.js";
import { get } from 'http';

// Configuración de multer
// Configuración de Multer con límite de tamaño
const upload = multer({
  storage: multer.memoryStorage(), // Usar almacenamiento en memoria
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar el tamaño de cada archivo a 5 MB (en bytes)
    fields: 10,
    files: 20,
    parts: 30
  },
  fileFilter: (req, file, cb) => {
    // Verificar que el archivo sea una imagen
    if (file.mimetype.startsWith('image/')) {
      return cb(null, true);
    }
    return cb(new Error('Solo se permiten archivos de imagen'), false);
  }
});
const router = express.Router();

// Ruta para crear un edificio con imágenes
router.post("/building", upload.fields([{ name: 'mainImage' }, { name: 'imageForPlant' }]), createBuilding);

// Ruta para obtener edificios
router.get("/building", getBuildings);
router.get('/building/:id', getImageById);


export default router;
