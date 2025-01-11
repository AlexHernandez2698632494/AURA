import express from "express";
import {
  getHistory,
  getDeletedHistory,
  deleteHistory,
  deleteStateByLevel,
  permanentDeleteHistory,
  cleanSlateByLevel,
} from "../controllers/history.controllers.js";
import { verifyToken } from "../Middleware/auth.js";

const router = express.Router();

router.get("/history", verifyToken, getHistory); // Obtener entradas activas
router.get("/history/delete", verifyToken, getDeletedHistory); // Entradas eliminadas
router.delete("/history/:id", verifyToken, deleteHistory); // Eliminar entrada lógicamente
router.patch("/history/:id/permanent", verifyToken, permanentDeleteHistory); 
router.delete("/history/delete/:nivel", verifyToken, deleteStateByLevel); // Restaurar entrada
router.delete("/history/:nivel/CleanSlate", verifyToken,cleanSlateByLevel)

export default router;
