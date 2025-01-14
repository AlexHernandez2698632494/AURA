import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Authority } from "../models/authorities.models.js";

dotenv.config();

await connectDB();

const authorities = [
  // Administradores
  { name: "super_administrador" },
  { name: "administrador" },

  // Listar (READ)
  { name: "list_alert" },
  { name: "list_sensors" },
  { name: "list_suscriptions" },
  { name: "list_users" },
  { name: "list_iot_service" },

  // Crear (CREATE)
  { name: "create_alert" },
  { name: "create_sensors" },
  { name: "create_suscription" },
  { name: "create_users" },
  { name: "create_iot_service" },

  // Editar (UPDATE)
  { name: "edit_alert" },
  { name: "edit_sensors" },
  { name: "edit_suscription" },
  { name: "edit_user" },
  { name: "edit_iot_service" },

  // Eliminar (DELETE)
  { name: "delete_alert" },
  { name: "delete_sensors" },
  { name: "delete_suscription" },
  { name: "delete_user" },
  { name: "delete_iot_service" },

  // Restaurar (RESTORE)
  { name: "restore_alert" },
  { name: "restore_sensors" },
  { name: "restore_suscription" },
  { name: "restore_user" },
  { name: "restore_iot_service" },

  // DEV
  {
    _id: new mongoose.Types.ObjectId("64eabbf1e213f99865d6c2d4"), 
    name: "dev",
  },
];

const seedAuthorities = async () => {
  try {
    console.log("Seeding authorities...");

    for (const authority of authorities) {
      const exists = await Authority.findOne({ name: authority.name });
      if (!exists) {
        await Authority.create(authority);
        console.log(`Authority created: ${authority.name}`);
      } else {
        console.log(`Authority already exists: ${authority.name}`);
      }
    }

    console.log("Authorities seeding completed.");
   // await mongoose.connection.close();
  } catch (error) {
    console.error("Error while seeding authorities:", error);
    process.exit(1);
  }
};

export default seedAuthorities;
