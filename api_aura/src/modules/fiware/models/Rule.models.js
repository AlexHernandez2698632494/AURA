import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const RuleSchema = new mongoose.Schema(
  {
    conditions: [
      {
        sensorEntityId: { type: String, required: true }, // Sensor al que se refiere la condición
        sensorEntityName: { type: String, required: true },
        sensorAttribute: { type: String, required: true }, // Variable del sensor
        conditionType: {
          type: String,
          required: true,
          enum: ["greater", "less", "between", "equal", "function"],
        },
        value: { type: mongoose.Schema.Types.Mixed, required: true },
      },
    ],
    conditionLogic: { type: String,  enum: ["AND", "OR"] },
    actuatorEntityId: { type: String, required: true },
    actuatorEntityName: { type: String, required: true },
    command: { type: String, required: true },
    commandValue: { type: [mongoose.Schema.Types.Mixed], required: true },
    enabled: { type: Boolean},
    estadoEliminacion: {
      type: Number,
    },
    service: { type: String, required: true },
    subservice: { type: String, required: true },
  },
  { timestamps: true }
);

export default connectDB.model("rule", RuleSchema);
