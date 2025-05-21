import mongoose from "mongoose"
import { connectDB } from "../../../config/db.js"

const authoritiesSchema = new mongoose.Schema({
    name: { type: String, required: true},
    type: { type: String,},  
    estadoEliminacion: { type: Number, default: 0, enum: [0, 1] }  // Agregado estadoEliminacion
})

export const Authority = connectDB.model("authority",authoritiesSchema)