import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const UserSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    apellido:{ type:String,required:true},
    correo: { type: mongoose.Schema.Types.ObjectId, ref: "Email", required: true },
    usuario: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    authorities: [{ type: mongoose.Schema.Types.ObjectId, ref: "authority" }],
    estadoEliminacion: { type: Number, default: 0, enum: [0, 1] }  // Agregado estadoEliminacion
    });

export const User = connectDB.model("User", UserSchema);