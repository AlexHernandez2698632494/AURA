import express from "express";
import userRoutes from "./routes/users.routes.js";
import premiumRoutes from "./routes/userPayment.routes.js";
import authoritiesKeyRoutes from "./routes/authoritiesKey.routes.js";
import historyRoutes from "./routes/history.routes.js";
import devRoutes from "./routes/dev/usersDev.routes.js";

const router = express.Router();

router.use("/oauth2",userRoutes);
router.use("/oauth2", premiumRoutes);
router.use("/oauth2", authoritiesKeyRoutes);
router.use("/oauth2", historyRoutes);
router.use("/oauth2", devRoutes);


export default router;