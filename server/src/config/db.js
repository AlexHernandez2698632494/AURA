import mongoose from "mongoose";
import dotenv from "dotenv";

// Cargar las variables de entorno
dotenv.config();

export const connectDB = mongoose.createConnection(process.env.MONGO_URI);
export const connectFiwareDB = mongoose.createConnection(process.env.MONGO_URI_IOT_DEVICE);

// Función para crear una conexión dinámica con una base de datos específica
export const connectBuildingDB = async (buildingName) => {
  try {
    const formattedBuildingName = buildingName.replace(/\s+/g, '_'); // Reemplaza los espacios por guiones bajos
    const dbUri = `mongodb://localhost:27017/building-${formattedBuildingName}`;
    await mongoose.connect(dbUri);
    console.log(`Conexión exitosa a la base de datos: building-${formattedBuildingName}`);
  } catch (error) {
    console.error(`Error al conectar a la base de datos: building-${formattedBuildingName}`);
    throw new Error(`No se pudo conectar a la base de datos: building-${formattedBuildingName}`);
  }
};
// Conectar a la base de datos de autenticación
connectDB.once("open", () => {
  console.log("📌 Conectado a la base de datos de autenticacion");
  console.log(`MongoDB Conectado: ${connectDB.host}`);  // Verificar la conexión de DB de autenticación
});

// Conectar a la base de datos de Fiware
connectFiwareDB.once("open", () => {
  console.log("🌍 Conectado a la base de datos de Fiware");
  console.log(`Fiware DB Conectada: ${connectFiwareDB.host}`);  // Verificar la conexión de Fiware DB
});

// Manejo de errores
connectDB.on("error", (err) => console.error("❌ Error en Usuarios DB:", err));
connectFiwareDB.on("error", (err) => console.error("❌ Error en Fiware DB:", err));
