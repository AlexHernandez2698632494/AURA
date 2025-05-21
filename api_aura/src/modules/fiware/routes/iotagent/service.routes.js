import express from 'express';
import { deleteService, registerService } from '../../controllers/iotagent/service.controller.js';

const router = express.Router();

router.post('/services', registerService);
router.delete('/services', deleteService)

export default router;