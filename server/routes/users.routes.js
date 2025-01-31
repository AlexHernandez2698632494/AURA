import express from "express";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  loginUser, 
  changePassword,
  getDeleteUsers,
  restoreUser,
  getAuthorities,
  restorePassword,
  logoutUser,
  checkIfUsersExist,
  registerFirstAdmin,
  deleteUsersCleanSlate,
  getUserByUsername
} from "../controllers/users.controllers.js";
import { verifyToken } from "../Middleware/auth.js";

const router = express.Router();

router.get("/users",verifyToken, getUsers); // Protege la ruta
router.get("/users/delete",verifyToken,getDeleteUsers)
router.get('/authorities', getAuthorities);
//router.get("/user/:id",verifyToken,  getUserById); // Protege la ruta
router.get("/user/:usuario", verifyToken, getUserByUsername);
router.post("/user", createUser); // Ruta pública
router.put("/user/:id", verifyToken, updateUser); // Protege la ruta
router.patch("/user/:id", verifyToken, deleteUser); // Protege la ruta
router.patch("/user/restore/:id", verifyToken, restoreUser)
router.post("/login", loginUser); // Ruta pública para login
router.post('/change-password',verifyToken, changePassword);
router.post("/restore-password", restorePassword);
router.post("/logout", logoutUser)
router.get("/users/exist",checkIfUsersExist)
router.post("/register-superadmin", registerFirstAdmin)
router.delete("/users/cleanSlate", verifyToken, deleteUsersCleanSlate);

export default router;
