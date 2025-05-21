import express from "express";
import {
  checkConnection,
  getPrefixes,
  getRoutesByPrefix,
} from "../../auth/controllers/checkConnection.controller.js";

const router = express.Router();
router.get("/", getPrefixes); // lista de prefijos
router.get("/route/:prefix", getRoutesByPrefix); // rutas por prefijo
router.get("/ping", checkConnection);

export default router;
