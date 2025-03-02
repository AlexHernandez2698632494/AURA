import express from 'express';
import { createDevice } from '../../controllers/iotagent/devices.controller.js';

const router = express.Router();

router.post('/devices',createDevice)

export default router;