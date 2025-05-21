import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { User } from "../modules/auth/models/users.models.js";
import { Email } from "../modules/auth/models/emails.models.js"; // import correcto según tu ruta

dotenv.config();

const dbConnection = connectDB;

await new Promise((resolve, reject) => {
  dbConnection.once("open", resolve);
  dbConnection.on("error", reject);
});

// Paso 1: Crear o buscar el correo
const correoTexto = "dev@simati.com";

let emailDoc = await Email.findOne({ correo: correoTexto });
if (!emailDoc) {
  emailDoc = await Email.create({ correo: correoTexto });
  console.log(`✅ Email creado: ${correoTexto}`);
} else {
  console.log(`⚠️ Email ya existe: ${correoTexto}`);
}

// Paso 2: Usar el ObjectId del correo en el usuario
const users = [
  {
    nombre: "Dev",
    apellido: "eloper",
    correo: emailDoc._id,
    usuario: "dev",
    contrasena: "$2a$10$3wo22si1mZHoXUhCckcuFegooXPx5cA9ajyV6qOill7/X/NkQe2/.", // deviiie
    authorities: ["64eabbf1e213f99865d6c2d4"],
    nivel: 2,
  },
];

const seedUsers = async () => {
  try {
    console.log("🚀 Seeding users...");

    for (const user of users) {
      const exists = await User.findOne({ correo: user.correo }).exec();
      if (!exists) {
        await User.create(user);
        console.log(`✅ Usuario creado: ${user.nombre}`);
      } else {
        console.log(`⚠️ Usuario ya existe: ${user.nombre}`);
      }
    }

    console.log("✅ Finalizó el seed de usuarios.");
  } catch (error) {
    console.error("❌ Error durante el seed de usuarios:", error);
    process.exit(1);
  }
};

await seedUsers();

export default seedUsers;
