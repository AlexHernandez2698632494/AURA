import express from 'express'; 
import { checkConnection } from '../controllers/index.controllers.js';

const router = express.Router();
router.get('/ping', checkConnection);
export default router;