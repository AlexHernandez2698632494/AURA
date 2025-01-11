import { History } from "../models/history.models.js";
import moment from "moment";

// Obtener todas las entradas de historial activas
export const getHistory = async (req, res) => {
  try {
    const history = await History.find({ estadoEliminacion: 0 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener entradas de historial eliminadas
export const getDeletedHistory = async (req, res) => {
  try {
    const history = await History.find({ estadoEliminacion: 1 });
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar lógicamente una entrada de historial
export const deleteHistory = async (req, res) => {
  try {
    const historyEntry = await History.findById(req.params.id);

    if (!historyEntry) {
      return res.status(404).json({ message: "Entrada de historial no encontrada" });
    }

    historyEntry.estadoEliminacion = 1;
    await historyEntry.save();

    res.status(200).json({ message: "Entrada de historial eliminada lógicamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar el estado de eliminación de todos los elementos con un nivel específico
export const deleteStateByLevel = async (req, res) => {
  try {
    const { nivel } = req.params;  // Obtener el nivel desde los parámetros de la ruta

    // Verificar que el nivel sea proporcionado
    if (!nivel) {
      return res.status(400).json({ message: "El nivel es requerido" });
    }

    // Actualizar las entradas con el nivel especificado y establecer estadoEliminacion a 1
    const result = await History.updateMany(
      { nivel: nivel }, // Filtrar por nivel
      { $set: { estadoEliminacion: 1 } } // Establecer estadoEliminacion a 1
    );

    if (result.nModified === 0) {
      return res.status(404).json({ message: "No se encontraron registros con ese nivel" });
    }

    res.status(200).json({ message: `Se actualizaron ${result.nModified} entradas de historial` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar permanentemente una entrada de historial
export const permanentDeleteHistory = async (req, res) => {
  try {
    const historyEntry = await History.findByIdAndDelete(req.params.id); // Eliminar el historial por ID

    if (!historyEntry) {
      return res.status(404).json({ message: "Entrada de historial no encontrada" });
    }

    res.status(200).json({ message: "Entrada de historial eliminada permanentemente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar permanentemente todas las entradas de historial con un nivel específico
export const cleanSlateByLevel = async (req, res) => {
  try {
    const { nivel } = req.params; // Obtener el nivel desde los parámetros de la ruta

    // Verificar que el nivel sea proporcionado
    if (!nivel) {
      return res.status(400).json({ message: "El nivel es requerido" });
    }

    // Eliminar permanentemente las entradas con el nivel especificado
    const result = await History.deleteMany({ nivel: nivel });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "No se encontraron registros con ese nivel para eliminar" });
    }

    res.status(200).json({ message: `Se eliminaron permanentemente ${result.deletedCount} entradas de historial` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
