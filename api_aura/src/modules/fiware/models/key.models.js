import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const KeySchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true, // Clave única
  },
  type: {
    type: String,
    enum: ['apikey', 'device'],
    required: true, // Tipo de clave
  },
  authority: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "authority",
    required: true, // Referencia al modelo de Authority
  },
}, {
  timestamps: true,
});

// Exportar el modelo usando la conexión personalizada
export const Key = connectDB.model("Key", KeySchema);
