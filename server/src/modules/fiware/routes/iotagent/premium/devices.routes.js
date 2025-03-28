import express from 'express';
import { createServiceDeviceJSON } from '../../../controllers/iotagent/premium/devices.controller.js';

const router = express.Router();

router.post('/devices/json',createServiceDeviceJSON)

export default router;