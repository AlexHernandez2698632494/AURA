import { Router } from "express";
import {
  getDevUsers,
  getDevAuthorities,
  getDeletedDevUsers,
  getDevUserById,
  createDevUser,
  updateDevUser,
  deleteDevUser,
  restoreDevUser,
  loginDevUser,
  changeDevPassword,
  restoreDevPassword,
  logoutDevUser,
  checkIfDevUsersExist,
  registerFirstDevAdmin,
} from "../../controllers/dev/usersdev.controller.js";

const router = Router();

// Rutas para obtener usuarios
router.get("/dev/users", getDevUsers); // Obtener todos los usuarios activos en dev
router.get("/dev/users/deleted", getDeletedDevUsers); // Obtener usuarios eliminados en dev
router.get("/dev/users/:id", getDevUserById); // Obtener usuario por ID en dev
router.get("/dev/authorities", getDevAuthorities); // Obtener todas las autoridades en dev

// Rutas para crear, actualizar y eliminar usuarios
router.post("/dev/users", createDevUser); // Crear un nuevo usuario en dev
router.put("/dev/users/:id", updateDevUser); // Actualizar un usuario en dev
router.delete("/dev/users/:id", deleteDevUser); // Eliminar un usuario en dev
router.put("/dev/users/restore/:id", restoreDevUser); // Restaurar un usuario en dev

// Rutas para autenticación
router.post("/dev/login", loginDevUser); // Iniciar sesión en dev
router.post("/dev/logout", logoutDevUser); // Cerrar sesión en dev

// Rutas para cambios de contraseñas
router.post("/dev/change-password", changeDevPassword); // Cambiar la contraseña en dev
router.post("/dev/restore-password", restoreDevPassword); // Restablecer la contraseña en dev

// Ruta para verificar si existen usuarios
router.get("/dev/check-users", checkIfDevUsersExist); // Verificar si existen usuarios en dev

// Ruta para registrar el primer administrador en dev
router.post("/dev/register-first-admin", registerFirstDevAdmin); // Registrar el primer administrador en dev

export default router;
