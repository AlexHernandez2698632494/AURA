import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  usuario: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  authorities: [{ type: mongoose.Schema.Types.ObjectId, ref: "authority" }],
  estadoEliminacion: { type: Number, default: 0, enum: [0, 1] }  // Agregado estadoEliminacion
});

export const User = mongoose.model("User", UserSchema);
