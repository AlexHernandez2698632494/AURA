import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import { Authority } from "../modules/auth/models/authorities.models.js";

dotenv.config();

await connectDB();

const authorities = [
  // Administradores
  { name: "super_administrador", type: "super_administrador" },
  // DEV
  {
    _id: new mongoose.Types.ObjectId("64eabbf1e213f99865d6c2d4"),
    name: "dev",
    type: "dev",
  },
  { name: "administrador", type: "administrador" },
  
  // Listar (READ)
  { name: "list_alert", type: "list_alert" },
  { name: "list_sensors", type: "list_sensors" },
  { name: "list_suscriptions", type: "list_suscriptions" },
  { name: "list_users", type: "list_users" },
  { name: "list_iot_service", type: "list_iot_service" },

  // Crear (CREATE)
  { name: "create_alert", type: "create_alert" },
  { name: "create_sensors", type: "create_sensors" },
  { name: "create_suscription", type: "create_suscription" },
  { name: "create_users", type: "create_users" },
  { name: "create_iot_service", type: "create_iot_service" },

  // Editar (UPDATE)
  { name: "edit_alert", type: "edit_alert" },
  { name: "edit_sensors", type: "edit_sensors" },
  { name: "edit_suscription", type: "edit_suscription" },
  { name: "edit_user", type: "edit_user" },
  { name: "edit_iot_service", type: "edit_iot_service" },

  // Eliminar (DELETE)
  { name: "delete_alert", type: "delete_alert" },
  { name: "delete_sensors", type: "delete_sensors" },
  { name: "delete_suscription", type: "delete_suscription" },
  { name: "delete_user", type: "delete_user" },
  { name: "delete_iot_service", type: "delete_iot_service" },

  // Restaurar (RESTORE)
  { name: "restore_alert", type: "restore_alert" },
  { name: "restore_sensors", type: "restore_sensors" },
  { name: "restore_suscription", type: "restore_suscription" },
  { name: "restore_user", type: "restore_user" },
  { name: "restore_iot_service", type: "restore_iot_service" },
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
