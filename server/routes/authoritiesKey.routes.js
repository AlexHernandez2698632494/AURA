import { Router } from "express";
import {createAuthorityKey } from "../controllers/authoritiesKey.controllers.js";


const router= Router();

router.post('/authoritiesKey', createAuthorityKey);

export default router;