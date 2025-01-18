import express from "express";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import statusRoutes from "./routes/index.routes.js";
import userRoutes from "./routes/users.routes.js";
import historiesRoutes from "./routes/history.routes.js";
import devRoutes from "./routes/dev/usersDev.routes.js";
const app = express();

app.use(cors());

app.use(express.json());
app.use(bodyParser.json());

app.use(userRoutes);
app.use(statusRoutes);
app.use(historiesRoutes);
app.use(devRoutes)
connectDB();

app.listen(3000);
console.log("Server is running on port 3000");
