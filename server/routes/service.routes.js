import { Router } from "express";
import {
  createService,
  deleteService,
  getServices,
  restoreService,
  softDeleteService,
  updateService,
} from "../controllers/service.controllers.js";

const serviceRoute = Router();

serviceRoute.post("/", createService);
serviceRoute.get("/", getServices);
serviceRoute.put("/:id", updateService);
serviceRoute.patch("/:id/soft-delete", softDeleteService);
serviceRoute.patch("/:id/restore", restoreService);
serviceRoute.delete("/:id", deleteService);

export default serviceRoute;
