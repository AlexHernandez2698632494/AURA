import {
  changePassword,
  checkIfUsersExist,
  createUser,
  deleteUser,
  deleteUsersCleanSlate,
  getAuthorities,
  getDeleteUsers,
  getUserById,
  getUsers,
  loginUser,
  logoutUser,
  registerFirstAdmin,
  restorePassword,
  restoreUser,
  updateUser,
} from "../controllers/users.controller.js";
import { verifyToken } from "../../../middleware/auth.js";
import express from "express";

const router = express.Router();

router.get("/users", verifyToken, getUsers);
router.get("/users", verifyToken, getUsers); // Protege la ruta
router.get("/users/delete", verifyToken, getDeleteUsers);
router.get("/authorities", getAuthorities);
//router.get("/user/:id",verifyToken,  getUserById); // Protege la ruta
router.get("/user/:usuario", verifyToken, getUserById);
router.post("/user", createUser); // Ruta pública
router.put("/user/:id", verifyToken, updateUser); // Protege la ruta
router.patch("/user/:id", verifyToken, deleteUser); // Protege la ruta
router.patch("/user/restore/:id", verifyToken, restoreUser);
router.post("/login", loginUser); // Ruta pública para login
router.post("/change-password", verifyToken, changePassword);
router.post("/restore-password", restorePassword);
router.post("/logout", logoutUser);
router.get("/users/exist", checkIfUsersExist);
router.post("/register-superadmin", registerFirstAdmin);
router.delete("/users/cleanSlate", verifyToken, deleteUsersCleanSlate);

export default router;
