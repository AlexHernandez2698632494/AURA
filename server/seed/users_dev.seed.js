import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { UserDev } from "../models/dev/users_dev.models.js";

dotenv.config();

await connectDB();

const users = [
  {
    nombre: "Dev",
    correo: "dev@simati.com",
    usuario: "dev",
    contrasena: "2a$10$7NmAQ9WhsExMfolw.TiOCeUkpi10yj3mtdLqjmhGKQzjmTCt9YB6u", // la contraseña es deviiie
    authorities: ["64eabbf1e213f99865d6c2d4"],
  },
];

const seedUsers = async () => {
  try {
    console.log("Seeding users...");

    for (const user of users) {
      const exists = await UserDev.findOne({ correo: user.correo });
      if (!exists) {
        await UserDev.create(user);
        console.log(`User created: ${user.nombre}`);
      } else {
        console.log(`User already exists: ${user.nombre}`);
      }
    }

    console.log("Users seeding completed.");
    // await mongoose.connection.close();
  } catch (error) {
    console.error("Error while seeding users:", error);
    process.exit(1);
  }
};

export default seedUsers;
