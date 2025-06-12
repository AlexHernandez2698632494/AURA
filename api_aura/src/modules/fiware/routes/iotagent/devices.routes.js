import express from 'express';
import { createDevice, deleteDevice, getDevicesbyId } from '../../controllers/iotagent/devices.controller.js';

const router = express.Router();

router.post('/devices',createDevice)
router.get('/device/:deviceId',getDevicesbyId)
router.delete('/devices/:deviceId', deleteDevice)

export default router;