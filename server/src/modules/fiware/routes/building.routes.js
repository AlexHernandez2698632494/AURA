import express from "express";
import multer from "multer";
import {
  cleanSlateBuilding,
  createBuilding,
  deleteBuilding,
  getBuildings,
  getImageById,
  restoreBuilding,
  updateBuilding,
} from "../controllers/building.controller.js";
// Configuración de multer
const upload = multer({
  storage: multer.memoryStorage(), // Usar almacenamiento en memoria
  limits: {
    fileSize: 5 * 1024 * 1024, // Limitar el tamaño de cada archivo a 5 MB (en bytes)
    fields: 10,
    files: 20,
    parts: 30,
  },
  fileFilter: (req, file, cb) => {
    // Verificar que el archivo sea una imagen
    if (file.mimetype.startsWith("image/")) {
      return cb(null, true);
    }
    return cb(new Error("Solo se permiten archivos de imagen"), false);
  },
});
const router = express.Router();

// Ruta para crear un edificio con imágenes
router.post(
  "/building",
  upload.fields([{ name: "mainImage" }, { name: "imageForPlant" }]),
  createBuilding
);
router.get("/building", getBuildings);
router.get("/building/:id", getImageById);
router.put(
  "/building/:id",
  upload.fields([{ name: "mainImage" }, { name: "imageForPlant" }]),
  updateBuilding
);
router.patch("/building/:id", deleteBuilding);
router.patch("/building/:id/restore", restoreBuilding);
router.delete("/building/:id/cleanSlate", cleanSlateBuilding);

export default router;
