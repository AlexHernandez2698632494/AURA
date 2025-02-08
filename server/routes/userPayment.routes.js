import express from "express";
import {
  createFirstUserPayment,
  deletePaymentUser,
  getPaymentUserById,
  getPaymentUsers,
  restorePaymentUser,
  updatePaymentUser,
} from "../controllers/userPayment.controllers.js";

const router = express.Router();

// Ruta protegida para crear un usuario premium de pago (requiere autenticación)
router.post("/premium/user", createFirstUserPayment); // Crear usuario premium de pago (requiere token)

// Ruta protegida para obtener todos los usuarios premium de pago (requiere autenticación)
router.get("/premium/users", getPaymentUsers); // Obtener todos los usuarios premium de pago

// Ruta para obtener un usuario premium de pago por ID (requiere autenticación)
router.get("/premium/user/:id", getPaymentUserById); // Obtener un usuario premium de pago por ID

// Ruta para actualizar un usuario premium de pago por ID (requiere autenticación)
router.put("/premium/user/:id", updatePaymentUser); // Actualizar usuario premium de pago

// Ruta para eliminar un usuario premium de pago (cambiar estadoEliminacion a 1)
router.patch("/premium/user/:id/delete", deletePaymentUser); // Eliminar usuario premium de pago (cambiar estadoEliminacion a 1)

// Ruta para restaurar un usuario premium de pago (cambiar estadoEliminacion a 0)
router.patch("/premium/user/:id/restore", restorePaymentUser); // Restaurar usuario premium de pago (cambiar estadoEliminacion a 0)

export default router;
