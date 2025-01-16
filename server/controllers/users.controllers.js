import { User } from "../models/users.models.js";
import { Authority } from "../models/authorities.models.js"; // Importar el modelo Authority
import { History } from "../models/history.models.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import moment from "moment";

// Obtener todos los usuarios activos
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ estadoEliminacion: 0 }).populate("authorities"); // Poblar authorities
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAuthorities = async (req, res) => {
  try {
    const authorities = await Authority.find(); // Obtiene todas las autoridades
    res.status(200).json(authorities);          // Devuelve las autoridades como un array en formato JSON
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener las autoridades', error: error.message });
  }
}; 

// Obtener todos los usuarios eliminados (estadoEliminacion = 1)
export const getDeleteUsers = async (req, res) => {
  try {
    const users = await User.find({ estadoEliminacion: 1 }).populate("authorities"); // Poblar authorities
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener usuario por ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      estadoEliminacion: 0,
    }).populate("authorities"); // Poblar authorities

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  const { nombre, correo, usuario, authorities, estadoEliminacion, usuarioHistory } = req.body;

  try {
    // Verificar si las autoridades proporcionadas existen
    const validAuthorities = await Authority.find({
      _id: { $in: authorities.map((auth) => auth.id) },
    });
    if (validAuthorities.length !== authorities.length) {
      return res.status(400).json({ message: "Algunas autoridades no son válidas" });
    }

    const randomPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Crear el usuario
    const user = new User({
      nombre,
      correo,
      usuario,
      contrasena: hashedPassword,
      authorities: validAuthorities.map((auth) => auth._id),
      estadoEliminacion: estadoEliminacion || 0, // Asignar estadoEliminacion (por defecto 0 si no se pasa)
    });

    const newUser = await user.save();

    // Registrar la acción en el historial
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: usuarioHistory,  // Aquí usamos el usuario autenticado
      datetime: currentDateTime,
      action: "create_user", // Acción realizada
      nivel:0
    });
    await historyEntry.save();

    // Enviar correo de notificación
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

    // Responder con los detalles del usuario creado
    const userWithAuthorities = await User.findById(newUser._id).populate("authorities");

    res.status(201).json({
      message: "Usuario creado exitosamente",
      user: userWithAuthorities,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un usuario
export const updateUser = async (req, res) => {
  const { authorities, removeAuthorityId, nombre, usuario, correo } = req.body;
  const usuarioHistory = req.body.usuarioHistory; // Usuario que realiza la acción (enviado desde el frontend)
  
  try {
    // Buscar el usuario
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Verificar y actualizar las autoridades si se pasan en la solicitud
    if (authorities && Array.isArray(authorities)) {
      const validAuthorities = await Authority.find({ "_id": { $in: authorities } });
      if (validAuthorities.length !== authorities.length) {
        return res.status(400).json({ message: "Una o más autoridades no son válidas" });
      }
      // Actualizar las autoridades del usuario
      user.authorities = validAuthorities.map(auth => auth._id);
    }

    // Verificar y eliminar la autoridad si se pasa en la solicitud
    if (removeAuthorityId) {
      user.authorities = user.authorities.filter(auth => auth.toString() !== removeAuthorityId);
    }

    // Actualizar otros campos (nombre, usuario, correo)
    if (nombre) user.nombre = nombre;
    if (usuario) user.usuario = usuario;
    if (correo) user.correo = correo;

    // Guardar el usuario actualizado
    await user.save();

    // Registrar el historial
    const newHistory = new History({
      username: usuarioHistory,  // Quien hace la acción
      action: 'update_user',
      datetime: new Date().toISOString(),
      nivel: 0,  // Nivel de importancia (puedes ajustarlo según la lógica de tu aplicación)
    });

    await newHistory.save();

    // Regresar el usuario actualizado con las autoridades
    const updatedUser = await User.findById(req.params.id).populate("authorities");

    res.json({ message: "Usuario actualizado exitosamente", user: updatedUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar un usuario (actualiza estadoEliminacion a 1)
export const deleteUser = async (req, res) => {
  const { usuarioHistory } = req.body; // Usuario que realiza la acción

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Actualizar el estado del usuario
    user.estadoEliminacion = 1;
    await user.save();

    // Registrar la acción de eliminación en el historial
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: usuarioHistory, // Usuario que realiza la acción
      datetime: currentDateTime,
      action: "delete_user", // Acción realizada
      description: `El usuario ${usuarioHistory} desactivó al usuario ${user.usuario}`, // Descripción detallada
      nivel:0
    });
    await historyEntry.save();

    res.json({ message: "Usuario desactivado exitosamente " });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Restaurar un usuario (cambia estadoEliminacion a 0)
export const restoreUser = async (req, res) => {
  const { usuarioHistory } = req.body; // El usuario que realiza la acción
  
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { estadoEliminacion: 0 },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Registrar la acción de restauración en el historial
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: usuarioHistory, // El usuario que realiza la acción
      datetime: currentDateTime,
      action: "restore_user", // Acción realizada
      description: `El usuario ${usuarioHistory} restauró al usuario ${user.usuario}`, // Descripción detallada
      nivel:0
    });
    await historyEntry.save();

    res.json({ message: "Usuario restaurado exitosamente", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login de usuario
export const loginUser = async (req, res) => {
  const { identifier, contrasena } = req.body;

  try {
    const user = await User.findOne({
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

    // Registrar en la tabla history
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: user.usuario,
      datetime: currentDateTime,
      action: "login", // Acción realizada
      nivel:0
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

// Cambiar contraseña
export const changePassword = async (req, res) => {
  const { contrasenaActual, nuevaContrasena } = req.body;
  const { user } = req;

  try {
    const usuario = await User.findOne({ usuario: user.usuario });
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

export const restorePassword = async (req, res) => {
  const { usuario } = req.body;

  try {
    // Buscar al usuario por nombre de usuario
    const user = await User.findOne({ usuario });
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Generar una nueva contraseña aleatoria
    const newPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Actualizar la contraseña en la base de datos
    user.contrasena = hashedPassword;
    await user.save();

    // Configurar transporte para envío de correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Configurar opciones del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.correo,
      subject: "Restablecimiento de contraseña",
      text: `Hola ${user.nombre},\n\nTu contraseña ha sido restablecida exitosamente.\n\nNueva contraseña: ${newPassword}\n\nPor favor, inicia sesión y cambia tu contraseña lo antes posible.\n\nSaludos,\nEl equipo`,
    };

    // Enviar correo electrónico
    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Contraseña restablecida y enviada al correo" });
  } catch (error) {
    res.status(500).json({ message: "Error al restablecer la contraseña", error: error.message });
  }
};

export const logoutUser = async (req, res) => {
  const { username } = req.body;

  try {
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username,
      datetime: currentDateTime,
      action: "logout", // Acción realizada
      nivel:0
    });
    await historyEntry.save();

    res.status(200).json({ message: "Cierre de sesión registrado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const checkIfUsersExist = async (req, res) => {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      return res.status(200).json({ usersExist: false });
    }
    res.status(200).json({ usersExist: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const registerFirstAdmin = async (req, res) => {
  const { nombre, correo, usuario, usuarioHistory, autoridadId } = req.body;

  try {
    // Verificar si ya existe algún usuario en la base de datos
    const existingUser = await User.countDocuments();
    if (existingUser > 0) {
      return res.status(400).json({ message: "Ya existe un usuario en el sistema" });
    }

    // Verificar si la autoridad de superadmin existe
    const superAdminAuthority = await Authority.findById(autoridadId);
    if (!superAdminAuthority) {
      return res.status(400).json({ message: "La autoridad proporcionada no existe" });
    }

    const randomPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Crear el usuario con la autoridad de superadmin
    const user = new User({
      nombre,
      correo,
      usuario,
      contrasena: hashedPassword,
      authorities: [superAdminAuthority._id], // Asignamos la autoridad de superadmin
      estadoEliminacion: 0, // Aseguramos que el usuario no esté eliminado
    });

    const newUser = await user.save();

    // Registrar la acción de creación del primer superadmin en el historial
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: usuario,  // El usuario que está creando al superadmin
      datetime: currentDateTime,
      action: "register_first_admin", // Acción de registrar el primer superadmin
      nivel: 0,
      description: `Se ha registrado el primer superadmin con el nombre de usuario ${usuario}`, // Descripción
    });
    await historyEntry.save();

    // Enviar correo de notificación al nuevo superadmin
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
      subject: "Registro de superadmin exitoso",
      text: `Hola ${nombre},\n\nTu cuenta de superadmin ha sido creada exitosamente.\nUsuario: ${usuario}\nContraseña: ${randomPassword}\n\nPor favor, cambia tu contraseña después de iniciar sesión.\nSaludos, El equipo.`,
    };

    await transporter.sendMail(mailOptions);

    // Responder con el nuevo usuario creado
    const userWithAuthorities = await User.findById(newUser._id).populate("authorities");

    res.status(201).json({
      message: "Primer superadmin registrado exitosamente",
      user: userWithAuthorities,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
