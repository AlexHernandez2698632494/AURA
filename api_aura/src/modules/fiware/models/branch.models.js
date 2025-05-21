import mongoose from "mongoose";
import { connectBuildingDB } from "../../../config/db.js";

const branchSchema = new mongoose.Schema({
  nombre_salon: { type: String, required: true },
  imagen_salon: { type: mongoose.Schema.Types.ObjectId, required: true },
  edificioId: { type: mongoose.Schema.Types.ObjectId, required: true },
  nivel: { type: Number, required: true },
  fiware_servicepath: { type: String, required: true },
});

// Función para obtener el modelo dinámico de la colección de salones en la base de datos dinámica
export const getSalonModel = async (buildingName) => {
    try {
      // Conectamos a la base de datos dinámica del edificio
      await connectBuildingDB(buildingName); // Esto usa la conexión dinámica para cada edificio
  
      // Creamos el modelo dinámicamente para la base de datos conectada
      const SalonModel = mongoose.model("Salon", branchSchema, "salones");
  
      return SalonModel;
    } catch (error) {
      console.error("Error al obtener el modelo dinámico de salones:", error);
      throw error;
    }
  };