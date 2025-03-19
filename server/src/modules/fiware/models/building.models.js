import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const buildingSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
    },
    nivel: {
        type: Number,
        required: true,
    },
    imagenPrincipal: {
        type: String,
        required: true,
    },
    imagenesPlantas: {
        type: [String], // Arreglo de enlaces de imágenes para cada planta
        required: true,
    },
    localizacion: {
        type: [Number], // Arreglo [latitud, longitud]
        required: true,
        validate: {
            validator: function(value) {
                // Validar que el arreglo tenga exactamente dos elementos: latitud y longitud
                return value.length === 2 && 
                    !isNaN(value[0]) && !isNaN(value[1]);
            },
            message: 'La localización debe ser un arreglo de [latitud, longitud].',
        }
    },
    authorities: [{ type: mongoose.Schema.Types.ObjectId, ref: "authority" }],
    enabled: {
        type: Boolean,
        required: true,
        default: true,
    },
    estadoEliminacion: {
        type: Number,
        default: 0, // 0: no eliminado, 1: eliminado
    },
}, { timestamps: true });

const building = connectDB.model("building", buildingSchema);

export default building;