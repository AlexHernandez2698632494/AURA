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

export const getDelete = async (req, res) => {
  try {
    const now = moment();
    const currentMonth = now.month(); // Mes actual (0-11)
    const currentYear = now.year(); // Año actual

    // Calcular el rango de fechas del mes anterior
    const startOfPreviousMonth = moment()
      .year(currentMonth === 0 ? currentYear - 1 : currentYear)
      .month(currentMonth === 0 ? 11 : currentMonth - 1)
      .startOf("month")
      .toDate();

    const endOfPreviousMonth = moment()
      .year(currentMonth === 0 ? currentYear - 1 : currentYear)
      .month(currentMonth === 0 ? 11 : currentMonth - 1)
      .endOf("month")
      .toDate();

    // Eliminar los registros del mes anterior
    await History.deleteMany({
      datetime: {
        $gte: startOfPreviousMonth,
        $lte: endOfPreviousMonth,
      },
    });

    // Obtener todos los registros actuales
    const historyRecords = await History.find();

    res.status(200).json({
      message: "Registros del mes anterior eliminados exitosamente",
      data: historyRecords,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al procesar la solicitud", error: error.message });
  }
};