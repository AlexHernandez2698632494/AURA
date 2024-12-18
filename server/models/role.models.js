import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  roleId: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
  estadoEliminacion: { type: Number, default: 0 } // 0: activo por defecto
});

export const Role = mongoose.model("Role", RoleSchema);
