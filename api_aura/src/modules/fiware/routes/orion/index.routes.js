import { Router } from "express";
import { getEntities, getEntitiesbyId, getRegistrations, getSubscriptions, getTypes, updateEntity } from "../../controllers/orion/index.controller.js";

const router = Router();

router.get('/entities', getEntities);
router.get('/entities/:id', getEntitiesbyId);
router.get('/types',getTypes)
router.get('/subscriptions',getSubscriptions)
router.get('/registrations',getRegistrations)
router.post('/entities/:deviceName', updateEntity);
export default router;