import { Router } from "express";
import {createAuthorityKey } from "../controllers/authoritiesKey.controller.js";


const router= Router();

router.post('/authoritiesKey', createAuthorityKey);

export default router;