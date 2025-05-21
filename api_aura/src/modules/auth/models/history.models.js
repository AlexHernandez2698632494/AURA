import mongoose from 'mongoose';
import { connectDB } from '../../../config/db.js';

const HistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  action: { type: String, required: true },
  datetime: { type: String, required: true },
  estadoEliminacion: { type: Number, default: 0 }, // 0: Activo, 1: Eliminado lógicamente
  nivel:{type: Number, min:0, max:5}
});

export const History = connectDB.model('History', HistorySchema);
