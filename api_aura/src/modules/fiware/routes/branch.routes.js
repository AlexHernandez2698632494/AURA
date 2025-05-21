import express from "express";
import multer from "multer";
import { createBranch, getBranch, getImageById } from "../controllers/branch.controller.js";

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

router.post("/branch", upload.fields([{ name: "imagen_salon" }]), createBranch);
router.get("/branch/image/:id", getImageById);
router.get("/branch/:buildingName/:nivel?", getBranch);

export default router;
