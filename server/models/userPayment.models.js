import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  apellido:{ type:String,required:true},
  correo: { type: mongoose.Schema.Types.ObjectId, ref: "Email", required: true },
  usuario: { type: String, required: true, unique: true },
  contrasena: { type: String, required: true },
  registrationKey: [{ type: mongoose.Schema.Types.ObjectId, ref: "RegistrationKey", required: true }],
  estadoEliminacion: { type: Number, default: 0, enum: [0, 1] }  // Agregado estadoEliminacion
});

export const UserPayment = mongoose.model("UserPayment", UserSchema);
