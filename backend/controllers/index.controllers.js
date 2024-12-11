import mongoose from "mongoose";

export const checkConnection = async (req, res) => {
    try {
      // Verifica el estado de la conexión de MongoDB
      const state = mongoose.connection.readyState; 
      // Estados posibles: 0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando
      const status = {
        0: 'Disconnected',
        1: 'Connected',
        2: 'Connecting',
        3: 'Disconnecting'
      };
  
      // Realiza un ping a la base de datos
      await mongoose.connection.db.command({ ping: 1 });
  
      res.json({ status: status[state], message: 'MongoDB connection is healthy' });
    } catch (error) {
      res.status(500).json({ message: 'MongoDB connection error', error: error.message });
    }
  };