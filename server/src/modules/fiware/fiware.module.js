import express from 'express';
import alertRoutes from "./routes/Alert.routes.js";
import ngsiRoutes from "./routes/ngsi.routes.js";
import serviceRoutes from "./routes/iotagent/service.routes.js";

const router = express.Router();

router.use("/v1/ngsi",alertRoutes);
router.use("/v1/ngsi",ngsiRoutes);
router.use("/v1/ngsi",serviceRoutes);

export default router;