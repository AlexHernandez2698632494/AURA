import express from "express";
import {
  getHistory,
  getDeletedHistory,
  deleteHistory,
  restoreHistory,
} from "../controllers/history.controllers.js";
import { verifyToken } from "../Middleware/auth.js";

const router = express.Router();

router.get("/history", verifyToken, getHistory); // Obtener entradas activas
router.get("/history/delete", verifyToken, getDeletedHistory); // Entradas eliminadas
router.delete("/history/:id", verifyToken, deleteHistory); // Eliminar entrada lógicamente
router.patch("/history/restore/:id", verifyToken, restoreHistory); // Restaurar entrada

export default router;
