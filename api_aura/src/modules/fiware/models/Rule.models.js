import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const RuleSchema = new mongoose.Schema({
  ruleId: { type: String, unique: true },
  conditions: [
    {
      sensorEntityId: { type: String, required: true }, // Sensor al que se refiere la condición
      sensorAttribute: { type: String, required: true }, // Variable del sensor
      conditionType: {
        type: String,
        required: true,
        enum: ["greater", "less", "between", "equal", "function"],
      },
      value: { type: mongoose.Schema.Types.Mixed, required: true },
    },
  ],
  conditionLogic: { type: String, default: "AND", enum: ["AND", "OR"] },
  actuatorEntityId: { type: String, required: true },
  command: { type: String, required: true },
  commandValue: { type: [mongoose.Schema.Types.Mixed], required: true },
  enabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  service: { type: String, require: true },
  subservice: { type: String, require: true },
});

export default connectDB.model("rule", RuleSchema);
