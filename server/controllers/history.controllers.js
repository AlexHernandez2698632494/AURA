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

// Restaurar una entrada de historial
export const restoreHistory = async (req, res) => {
  try {
    const historyEntry = await History.findByIdAndUpdate(
      req.params.id,
      { estadoEliminacion: 0 },
      { new: true }
    );

    if (!historyEntry) {
      return res.status(404).json({ message: "Entrada de historial no encontrada" });
    }

    res.status(200).json({
      message: "Entrada de historial restaurada exitosamente",
      history: historyEntry,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
