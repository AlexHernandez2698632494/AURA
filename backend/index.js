import express from "express"
import { connectDB } from "./config/db.js"
import mongoose from "mongoose"
import bodyParser from "body-parser"
import cors from "cors" 

const app = express()

app.use(cors());
app.use(bodyParser.json());

connectDB();

app.listen(3000)
console.log("Server is running on port 3000")