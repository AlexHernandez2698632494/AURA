import express from "express";
import { getRoles,getRoleById,createRole,updateRole,deleteRole } from "../controllers/role.controllers.js";
  
  const router = express.Router();
  
  // Rutas para roles
  router.get("/roles", getRoles); // Obtener todos los roles
  router.get("/roles/:id", getRoleById); // Obtener un rol por ID
  router.post("/roles", createRole); // Crear un rol
  router.put("/roles/:id", updateRole); // Actualizar un rol
  router.delete("/roles/:id", deleteRole); // Eliminar un rol
  
  export default router;