import mongoose from "mongoose";
import { connectDB } from "../../../config/db.js";

const emailSchema = new mongoose.Schema({
  correo: { type: String, required: true, unique: true }
});

export const Email = connectDB.model("Email", emailSchema);
