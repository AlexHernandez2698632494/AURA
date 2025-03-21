import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import compression from 'compression';
import helmet from 'helmet';
import morgan from 'morgan';

import statusRoutes from "./modules/auth/routes/checkConnection.routes.js";
import authModule from "./modules/auth/auth.module.js";
import orionRoutes from "./modules/fiware/routes/orion/index.routes.js";
import fiwareModule from "./modules/fiware/fiware.module.js";

const app = express();

app.use(cors());
app.use(helmet())
app.use(compression());
app.use(express.json());
app.use(bodyParser.json());

app.use(statusRoutes);
app.use(authModule);
app.use(orionRoutes);
app.use(fiwareModule);

const PORT = process.env.PORT ;
app.listen(PORT);
console.log("Server is running on port " + PORT);