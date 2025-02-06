import mongoose from "mongoose";

// Esquema para la llave de registro
const registrationKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: () => new Date() }, // Aseguramos que se cree la fecha actual
  expiresAt: Date, // Fecha de expiración que se calcula dependiendo del tipo de plan
  planType: {
    type: String,
    enum: ["free", "limit", "month", "year"],
    required: true,
  },
  duration: { type: Number, required: true }, // Duración del plan (en meses o años)
  isExpired: { type: Boolean, default: false },
  correo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Email",
    required: true,
  },
  authorities: [{ type: mongoose.Schema.Types.ObjectId, ref: "authority" }],
});

// Middleware para calcular la fecha de expiración y si la llave ha expirado antes de guardar
registrationKeySchema.pre("save", function (next) {
  const currentDate = new Date(this.createdAt); // Creamos una copia de la fecha actual para evitar modificaciones en createdAt

  // Calcular la fecha de expiración según el plan
  switch (this.planType) {
    case "free":
      this.expiresAt = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 días de prueba
      break;
    case "limit":
      this.expiresAt = null; // Plan indefinido, sin expiración
      break;
    case "month":
      const daysInMonth = 30; // Aproximadamente 30 días por mes
      this.expiresAt = new Date(currentDate.getTime() + this.duration * daysInMonth * 24 * 60 * 60 * 1000); // Duración en meses, convertido a días
      break;
    case "year":
      const daysInYear = 365; // Aproximadamente 365 días por año (sin contar años bisiestos)
      this.expiresAt = new Date(currentDate.getTime() + this.duration * daysInYear * 24 * 60 * 60 * 1000); // Duración en años, convertido a días
      break;
    default:
      this.expiresAt = null;
      break;
  }

  // Verificar si la llave ha expirado
  if (this.expiresAt && this.expiresAt < new Date()) {
    this.isExpired = true;
  } else {
    this.isExpired = false;
  }

  next();
});

// Modelo
export const RegistrationKey = mongoose.model("RegistrationKey", registrationKeySchema);
