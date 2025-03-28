import express from 'express';
import alertRoutes from "./routes/Alert.routes.js";
import ngsiRoutes from "./routes/ngsi.routes.js";
import serviceRoutes from "./routes/iotagent/service.routes.js";
import devicesRoutes from "./routes/iotagent/devices.routes.js";
import buildingRoutes from "./routes/building.routes.js";
import branchRoutes from "./routes/branch.routes.js"
import devicesjsonRoutes from "./routes/iotagent/premium/devices.routes.js"
const router = express.Router();

router.use("/v1/ngsi",alertRoutes);
router.use("/v1/ngsi",ngsiRoutes);
router.use("/v1/ngsi",serviceRoutes);
router.use("/v1/ngsi",devicesRoutes);
router.use("/v1/ngsi",devicesjsonRoutes)
router.use("/v1/smartcity", buildingRoutes);
router.use("/v1/starcity",branchRoutes)

export default router;