import { Router } from "express";
import { getEntities, getRegistrations, getSubscriptions, getTypes } from "../../controllers/orion/index.controller.js";

const router = Router();

router.get('/entities', getEntities);
router.get('/types',getTypes)
router.get('/subscriptions',getSubscriptions)
router.get('/registrations',getRegistrations)

export default router;