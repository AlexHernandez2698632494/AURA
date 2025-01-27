import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  device_id: { type: String, required: true },
  entity_name: { type: String, required: true },
  entity_type: { type: String, required: true },
  timezone: { type: String, required: true },
  protocol: { type: String, required: true },
  transport: { type: String, required: true },
  apikey: { type: String, required: true },
  address: {
    type: Object,
    required: true,
  },
  location: {
    type: Object,
    required: true,
  },
  attributes: { type: Array, required: true },
  estadoEliminacion: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('Device', deviceSchema);
