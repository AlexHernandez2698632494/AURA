import mongoose from 'mongoose';

const envioHttpSchema = new mongoose.Schema(
  {
    sensors: {
      airTemp: Number,
      airHumy: Number,
      qtyRain: Number,
      soiHumy: Number,
      velWind: Number,
      co2Air: Number,
      aceGeoX: Number,
      aceGeoY: Number,
      aceGeoZ: Number,
      Water_level: Number
    },
    estadoEliminacion: { type: Number, default: 0 } // Campo para eliminación lógica
  },
  { timestamps: true }
);

const EnvioHttp = mongoose.model('EnvioHttp', envioHttpSchema);

export default EnvioHttp;
