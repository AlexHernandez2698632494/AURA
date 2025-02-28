import express from 'express';
import alertRoutes from "./routes/Alert.routes.js";
import ngsiRoutes from "./routes/ngsi.routes.js";

const router = express.Router();

router.use("/v1/ngsi",alertRoutes);
router.use("/v1/ngsi",ngsiRoutes);

export default router;