import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser, 
  changePassword
} from "../controllers/users.controllers.js";
import { verifyToken } from "../Middleware/auth.js";

const router = express.Router();

router.get("/users", getUsers); // Protege la ruta
router.get("/user/:id",verifyToken,  getUserById); // Protege la ruta
router.post("/user", createUser); // Ruta pública
router.put("/user/:id", verifyToken, updateUser); // Protege la ruta
router.delete("/user/:id", verifyToken, deleteUser); // Protege la ruta
router.post("/login", loginUser); // Ruta pública para login
router.post('/change-password',verifyToken, changePassword);

export default router;
