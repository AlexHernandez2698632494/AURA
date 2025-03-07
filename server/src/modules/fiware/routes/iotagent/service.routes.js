import express from 'express';
import { registerService } from '../../controllers/iotagent/service.controller.js';

const router = express.Router();

router.post('/services', registerService);

export default router;