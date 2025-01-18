import { UserDev } from "../../models/dev/users_dev.models.js";
import { History } from "../../models/history.models.js";
import { Authority } from "../../models/authorities.models.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import moment from "moment";

// Obtener todos los usuarios activos en dev
export const getDevUsers = async (req, res) => {
  try {
    const users = await UserDev.find({ estadoEliminacion: 0 }).populate("authorities");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los usuarios eliminados en dev
export const getDeletedDevUsers = async (req, res) => {
  try {
    const users = await UserDev.find({ estadoEliminacion: 1 }).populate("authorities");
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un usuario por ID en dev
export const getDevUserById = async (req, res) => {
  try {
    const user = await UserDev.findOne({ _id: req.params.id, estadoEliminacion: 0 }).populate("authorities");
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todas las autoridades en dev
export const getDevAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find();
    res.status(200).json(authorities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo usuario en dev
export const createDevUser = async (req, res) => {
  const { nombre, correo, usuario, authorities, estadoEliminacion, usuarioHistory } = req.body;
  try {
    const validAuthorities = await Authority.find({ _id: { $in: authorities.map((auth) => auth.id) } });
    if (validAuthorities.length !== authorities.length) return res.status(400).json({ message: "Algunas autoridades no son válidas" });
    
    const randomPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    const user = new UserDev({
      nombre,
      correo,
      usuario,
      contrasena: hashedPassword,
      authorities: validAuthorities.map((auth) => auth._id),
      estadoEliminacion: estadoEliminacion || 0,
    });

    const newUser = await user.save();

    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({ username: usuarioHistory, datetime: currentDateTime, action: "create_dev_user", nivel: 0 });
    await historyEntry.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Registro exitoso",
      text: `Hola ${nombre},\n\nTu cuenta ha sido creada exitosamente.\nUsuario: ${usuario}\nContraseña: ${randomPassword}\n\nPor favor, cambia tu contraseña después de iniciar sesión.\nSaludos, El equipo.`,
    };

    await transporter.sendMail(mailOptions);

    const userWithAuthorities = await UserDev.findById(newUser._id).populate("authorities");
    res.status(201).json({ message: "Usuario creado exitosamente", user: userWithAuthorities });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un usuario en dev
export const updateDevUser = async (req, res) => {
  const { authorities, removeAuthorityId, nombre, usuario, correo } = req.body;
  const usuarioHistory = req.body.usuarioHistory;

  try {
    const user = await UserDev.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    if (authorities && Array.isArray(authorities)) {
      const validAuthorities = await Authority.find({ "_id": { $in: authorities } });
      if (validAuthorities.length !== authorities.length) {
        return res.status(400).json({ message: "Una o más autoridades no son válidas" });
      }
      user.authorities = validAuthorities.map(auth => auth._id);
    }

    if (removeAuthorityId) {
      user.authorities = user.authorities.filter(auth => auth.toString() !== removeAuthorityId);
    }

    if (nombre) user.nombre = nombre;
    if (usuario) user.usuario = usuario;
    if (correo) user.correo = correo;

    await user.save();

    const newHistory = new History({
      username: usuarioHistory,
      action: "update_dev_user",
      datetime: new Date().toISOString(),
      nivel: 0,
    });

    await newHistory.save();

    const updatedUser = await UserDev.findById(req.params.id).populate("authorities");
    res.json({ message: "Usuario actualizado exitosamente", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un usuario en dev
export const deleteDevUser = async (req, res) => {
  const { usuarioHistory } = req.body;

  try {
    const user = await UserDev.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    user.estadoEliminacion = 1;
    await user.save();

    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: usuarioHistory,
      datetime: currentDateTime,
      action: "delete_dev_user",
      description: `El usuario ${usuarioHistory} desactivó al usuario ${user.usuario}`,
      nivel: 0,
    });
    await historyEntry.save();

    res.json({ message: "Usuario desactivado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restaurar un usuario en dev
export const restoreDevUser = async (req, res) => {
  const { usuarioHistory } = req.body;

  try {
    const user = await UserDev.findByIdAndUpdate(req.params.id, { estadoEliminacion: 0 }, { new: true });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: usuarioHistory,
      datetime: currentDateTime,
      action: "restore_dev_user",
      description: `El usuario ${usuarioHistory} restauró al usuario ${user.usuario}`,
      nivel: 0,
    });
    await historyEntry.save();

    res.json({ message: "Usuario restaurado exitosamente", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login de usuario en dev
export const loginDevUser = async (req, res) => {
  const { identifier, contrasena } = req.body;

  try {
    const user = await UserDev.findOne({
      $or: [{ correo: identifier }, { usuario: identifier }],
    }).populate("authorities", "name");

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) return res.status(401).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        usuario: user.usuario,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: user.usuario,
      datetime: currentDateTime,
      action: "login_dev",
      nivel: 0,
    });
    await historyEntry.save();

    res.status(200).json({
      message: "Inicio de sesión exitoso",
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        usuario: user.usuario,
        authorities: user.authorities.map((auth) => auth.name),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout de usuario en dev
export const logoutDevUser = async (req, res) => {
  const { username } = req.body;

  try {
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username,
      datetime: currentDateTime,
      action: "logout",
      nivel: 0,
    });
    await historyEntry.save();

    res.status(200).json({ message: "Cierre de sesión registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cambiar contraseña en dev
export const changeDevPassword = async (req, res) => {
  const { contrasenaActual, nuevaContrasena } = req.body;
  const { user } = req;

  try {
    const usuario = await UserDev.findOne({ usuario: user.usuario });
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const isMatch = await bcrypt.compare(contrasenaActual, usuario.contrasena);
    if (!isMatch) {
      return res.status(400).json({ message: "Contraseña actual incorrecta" });
    }

    const salt = await bcrypt.genSalt(10);
    usuario.contrasena = await bcrypt.hash(nuevaContrasena, salt);
    await usuario.save();

    res.status(200).json({ message: "Contraseña cambiada exitosamente" });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor", error });
  }
};

// Restablecer contraseña en dev
export const restoreDevPassword = async (req, res) => {
  const { correo } = req.body;

  try {
    const user = await UserDev.findOne({ correo });
    if (!user) return res.status(404).json({ message: "Correo no encontrado" });

    const tempPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    user.contrasena = await bcrypt.hash(tempPassword, salt);
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: "Restablecimiento de contraseña",
      text: `Hola, se ha solicitado restablecer tu contraseña. Tu nueva contraseña temporal es: ${tempPassword}. Por favor, cámbiala después de iniciar sesión.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Contraseña restablecida exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Verificar si existen usuarios en dev
export const checkIfDevUsersExist = async (req, res) => {
  try {
    const userCount = await UserDev.countDocuments();
    res.status(200).json({ exists: userCount > 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Registrar el primer administrador en dev
export const registerFirstDevAdmin = async (req, res) => {
  const { nombre, correo, usuario, contrasena } = req.body;

  try {
    const existingAdmin = await UserDev.findOne({ roles: "admin" });
    if (existingAdmin) return res.status(400).json({ message: "Ya existe un administrador" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(contrasena, salt);

    const admin = new UserDev({
      nombre,
      correo,
      usuario,
      contrasena: hashedPassword,
      roles: ["admin"],
    });

    await admin.save();
    res.status(201).json({ message: "Primer administrador creado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
