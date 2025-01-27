import { Router } from 'express';
import {
  createEnvioHttp,
  getEnvioHttp,
  getEnvioHttpById,
  updateEnvioHttp,
  softDeleteEnvioHttp,
  restoreEnvioHttp,
  deleteEnvioHttp
} from '../controllers/envioHttp.controllers.js';

const router = Router();

// Crear un nuevo registro
router.post('/', createEnvioHttp);

// Obtener todos los registros activos
router.get('/', getEnvioHttp);

// Obtener un registro por ID
router.get('/:id', getEnvioHttpById);

// Actualizar un registro por ID
router.put('/:id', updateEnvioHttp);

// Eliminar lógicamente un registro
router.patch('/:id/soft-delete', softDeleteEnvioHttp);

// Restaurar un registro
router.patch('/:id/restore', restoreEnvioHttp);

// Eliminar físicamente un registro
router.delete('/:id', deleteEnvioHttp);

export default router;
