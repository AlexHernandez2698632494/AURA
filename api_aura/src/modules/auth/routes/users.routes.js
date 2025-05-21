import {
  changePassword,
  checkIfUsersExist,
  createUser,
  deleteUser,
  deleteUsersCleanSlate,
  getAuthorities,
  getDeleteUsers,
  getUserById,
  getUserByUsername,
  getUsers,
  loginUser,
  logoutUser,
  registerFirstAdmin,
  restorePassword,
  restoreUser,
  updateUser,
  getUsersByAuthorityAndKey, // Nueva función importada
} from "../controllers/users.controller.js";

import { verifyToken } from "../../../middleware/auth.js";
import express from "express";

const router = express.Router();

// ==================== GET ====================

// Obtener todos los usuarios
router.get("/users", verifyToken, getUsers);

// Obtener usuarios eliminados lógicamente
router.get("/users/delete", verifyToken, getDeleteUsers);

// Obtener usuarios filtrados por authorityId y registrationKeyId
router.get("/users/filter", verifyToken, getUsersByAuthorityAndKey);

// Obtener lista de autoridades
router.get("/authorities", getAuthorities);

// Obtener usuario por nombre de usuario
router.get("/user/:usuario", verifyToken, getUserByUsername);

// Verificar existencia de usuarios
router.get("/users/exist", checkIfUsersExist);

// ==================== POST ====================

// Crear nuevo usuario
router.post("/user", createUser);

// Login de usuario
router.post("/login", loginUser);

// Cambiar contraseña
router.post("/change-password", verifyToken, changePassword);

// Restaurar contraseña
router.post("/restore-password", restorePassword);

// Logout de usuario
router.post("/logout", logoutUser);

// Registrar primer superadmin
router.post("/register-superadmin", registerFirstAdmin);

// ==================== PUT ====================

// Actualizar usuario
router.put("/user/:id", verifyToken, updateUser);

// ==================== PATCH ====================

// Eliminar (lógicamente) un usuario
router.patch("/user/:id", verifyToken, deleteUser);

// Restaurar un usuario eliminado
router.patch("/user/restore/:id", verifyToken, restoreUser);

// ==================== DELETE ====================

// Borrar permanentemente todos los usuarios eliminados
router.delete("/users/cleanSlate", verifyToken, deleteUsersCleanSlate);

export default router;
