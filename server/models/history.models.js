import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  action: { type: String, required: true },
  datetime: { type: String, required: true },
  estadoEliminacion: { type: Number, default: 0 }, // 0: Activo, 1: Eliminado lógicamente
});

export const History = mongoose.model('History', HistorySchema);
