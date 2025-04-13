import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { UserDev } from "../modules/auth/models/dev/users_dev.models.js";

dotenv.config();

// Obtener la conexión de usuarios (autenticación)
const dbConnection = connectDB;

// Esperar a que la conexión esté lista
await new Promise((resolve, reject) => {
  dbConnection.once("open", resolve);
  dbConnection.on("error", reject);
});

const users = [
  {
    nombre: "Dev",
    correo: "dev@simati.com",
    usuario: "dev",
    contrasena: "$2a$10$3wo22si1mZHoXUhCckcuFegooXPx5cA9ajyV6qOill7/X/NkQe2/.", // la contraseña es deviiie
    authorities: ["64eabbf1e213f99865d6c2d4"],
  },
];

const seedUsers = async () => {
  try {
    console.log("🚀 Seeding users...");

    for (const user of users) {
      const exists = await UserDev.findOne({ correo: user.correo }).exec();
      if (!exists) {
        await UserDev.create(user);
        console.log(`✅ User created: ${user.nombre}`);
      } else {
        console.log(`⚠️ User already exists: ${user.nombre}`);
      }
    }

    console.log("✅ Users seeding completed.");
  } catch (error) {
    console.error("❌ Error while seeding users:", error);
    process.exit(1);
  }
};

await seedUsers();

export default seedUsers;
