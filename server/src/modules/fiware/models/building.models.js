import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js"; // Importar la conexión desde db.js

const BuildingSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nivel: { type: Number, required: true },
  imagenPrincipal: { type: String, required: true }, // Referencia en GridFS
  imagenesPorNivel: [{ type: String }], // Referencias en GridFS
  locacion: {
    type: [Number], // [lat, lon]
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 2;
      },
      message: "Locación debe contener latitud y longitud",
    },
  },
  autoridad: { type: mongoose.Schema.Types.ObjectId, ref: "Authority", required: true },
  enable: { type: Boolean, default: true },
  estadoEliminacion: { type: Number, default: 0 },
});

// Crear el modelo utilizando la conexión connectDB
const Building = connectDB.model("Building", BuildingSchema);

export default Building;
