import mongoose from "mongoose";

const RoleSchema = new mongoose.Schema({
  roleId: { type: Number, required: true, unique: true },
  name: { type: String, required: true, unique: true },
});

export const Role = mongoose.model("Role", RoleSchema);
