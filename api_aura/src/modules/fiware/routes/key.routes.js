import express from 'express';
import {
  generateApiKey,
  generateDeviceKey,
  createApiKey,
  createDeviceKey,
  getApiKeys,
  getDeviceKeys,
} from '../controllers/key.controller.js';

const router = express.Router();

// Generar
router.get('/generate/apikey', generateApiKey);
router.get('/generate/devicekey', generateDeviceKey);

// Crear
router.post('/create/apikey', createApiKey);
router.post('/create/devicekey', createDeviceKey);

// Ver
router.get('/view/apikeys', getApiKeys);
router.get('/view/devicekeys', getDeviceKeys);

export default router;
