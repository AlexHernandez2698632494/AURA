import express from 'express';
import alertRoutes from "./routes/Alert.routes.js";

const router = express.Router();

router.use("/v1/ngsi",alertRoutes);

export default router;