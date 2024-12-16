import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  usuario: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role" }, // Referencia al rol
});

export const User = mongoose.model("User", UserSchema);
