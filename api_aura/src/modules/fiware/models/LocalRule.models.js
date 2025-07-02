import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const LocalRuleSchema = new mongoose.Schema(
  {
    description: { type: String, required: true },
    source: [
      {
        deviceId: { type: String, required: true }, // ID del dispositivo
        deviceName: { type: String, required: true }, // Nombre del dispositivo
        apikey: { type: String, required: true }, // API Key del dispositivo
        attribute: { type: String, required: true }, // Atributo del dispositivo
        service: { type: String, required: true },
        subservice: { type: String, required: true },
        topic: { type: String, required: true }, // Topic del dispositivo
      },
    ],
    condition: {
      operator: { type: String, required: true, enum: ["AND", "OR"] },
      conditions: [
        {
          attribute: { type: String, required: true }, // Atributo del dispositivo
          operator: {
            type: String,
            required: true,
            enum: ["greater", "less", "between", "equal", "function"],
          }, // Tipo de condición
          value: { type: mongoose.Schema.Types.Mixed, required: true }, // Valor de la
        },
      ],
    },
    target: {
      deviceActuadorId: { type: String, required: true }, // ID del dispositivo actuador
      deviceActuadorName: { type: String, required: true }, // Nombre del
      deviceActuadorApikey: { type: String, required: true }, // API Key del dispositivo actuador
      command: { type: String, required: true }, // Comando a enviar al dispositivo
      payload: { type: String, required: true }, // Payload del comando
      service: { type: String, required: true },
      subservice: { type: String, required: true },
    },
  },
  { timestamps: true }
);

export default connectDB.model("Rule", LocalRuleSchema);
