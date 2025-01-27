import { Router } from 'express';
import {
  createSubscription,
  getSubscriptions,
  updateSubscription,
  softDeleteSubscription,
  restoreSubscription,
  deleteSubscription,
} from '../controllers/subscription.controllers.js';

const router = Router();

router.post('/', createSubscription);
router.get('/', getSubscriptions);
router.put('/:id', updateSubscription);
router.patch('/:id/soft-delete', softDeleteSubscription);
router.patch('/:id/restore', restoreSubscription);
router.delete('/:id', deleteSubscription);

export default router;
