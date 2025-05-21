import { Router } from "express";
import {createAuthorityKey } from "../controllers/authoritiesKey.controller.js";
import { verifyToken } from "../../../middleware/auth.js";

const router= Router();

router.post('/authoritiesKey',verifyToken, createAuthorityKey);

export default router;