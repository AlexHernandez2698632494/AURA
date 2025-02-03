import mongoose from "mongoose";

const emailSchema = new mongoose.Schema({
  correo: { type: String, required: true, unique: true }
});

export const Email = mongoose.model("Email", emailSchema);
