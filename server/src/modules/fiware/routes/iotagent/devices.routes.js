import express from 'express';
import { createDevice, deleteDevice } from '../../controllers/iotagent/devices.controller.js';

const router = express.Router();

router.post('/devices',createDevice)
router.delete('/devices/:deviceId', deleteDevice)

export default router;