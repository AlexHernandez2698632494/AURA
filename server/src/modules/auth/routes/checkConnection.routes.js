import express from "express";
import {
  checkConnection,
  welcomeMessage,
} from "../../auth/controllers/checkConnection.controller.js";

const router = express.Router();
router.get("/", welcomeMessage);
router.get("/ping", checkConnection);

export default router;
