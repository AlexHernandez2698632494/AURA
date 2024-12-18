import express from "express";
import {
  getRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getDeleteRoles,
} from "../controllers/role.controllers.js";
import { verifyToken } from "../Middleware/auth.js";

const router = express.Router();

// Rutas para roles
router.get("/roles", verifyToken, getRoles); // Obtener todos los roles
router.get("/roles/delete", verifyToken, getDeleteRoles);
router.get("/roles/:id", verifyToken, getRoleById); // Obtener un rol por ID
router.post("/roles", createRole); // Crear un rol
router.put("/roles/:id", verifyToken, updateRole); // Actualizar un rol
router.delete("/roles/:id", verifyToken, deleteRole); // Eliminar un rol

export default router;
