import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  apikey: { type: String, required: true },
  cbroker: { type: String, required: true },
  entity_type: { type: String, required: true },
  resource: { type: String, required: true },
  estadoEliminacion: { type: Number, default: 0 }, // 0: Activo, 1: Eliminado
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
