import { Router } from "express";
import {
  createDevice,
  deleteDevice,
  getDevices,
  restoreDevice,
  softDeleteDevice,
  updateDevice,
} from "../controllers/device.controllers.js";

const devicesRoute = Router();

// Crear un dispositivo
devicesRoute.post("/", createDevice);

// Listar dispositivos (activos)
devicesRoute.get("/", getDevices);

// Actualizar un dispositivo
devicesRoute.put("/:id", updateDevice);

// Eliminar lógicamente un dispositivo
devicesRoute.patch("/:id/soft-delete", softDeleteDevice);

// Restaurar un dispositivo eliminado
devicesRoute.patch("/:id/restore", restoreDevice);

// Eliminar físicamente un dispositivo
devicesRoute.delete("/:id", deleteDevice);

export default devicesRoute;
