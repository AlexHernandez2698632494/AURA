import mongoose from "mongoose";
import dotenv from "dotenv";

// Cargar las variables de entorno
dotenv.config();

export const connectDB = async () => {
    try {
        // Intentar conectar a la base de datos
        await mongoose.connect(process.env.MONGO_URI);
        
        // Verificar que la conexión se haya realizado correctamente
        console.log(`MongoDB Conectado: ${mongoose.connection.host}`);
    } catch (error) {
        // Manejar cualquier error de conexión
        console.error(`Error al conectar a MongoDB: ${error.message}`);
    }
};