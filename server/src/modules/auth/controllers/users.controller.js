import {User} from '../models/users.models.js';
import {Authority} from '../models/authorities.models.js';
import {History} from '../models/history.models.js';
import {Email} from '../models/emails.models.js';
import { RegistrationKey } from '../models/registrationKey.models.js';
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import moment from "moment";
import mongoose from 'mongoose';

const ENCRYPTION_KEY = process.env.JWT_SECRET; // Debe ser de 32 bytes
const IV_LENGTH = 16; // Longitud del IV para AES

// Función para cifrar una clave
const encrypt = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
};

// Función para descifrar una clave
const decrypt = (text) => {
  const textParts = text.split(":");
  const iv = Buffer.from(textParts[0], "hex");
  const encryptedText = Buffer.from(textParts[1], "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

// Obtener todos los usuarios activos
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({ estadoEliminacion: 0 }).populate("authorities").populate("correo"); // Poblar authorities
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

export const getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({
      usuario: req.params.usuario,
      estadoEliminacion: 0,
    })
    .populate("authorities")
    .populate("correo")
    .populate("registrationKey"); // Poblar registrationKey

    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    // Convertir los registrationKey a objetos con ID y valor descifrado
    const decryptedRegistrationKeys = user.registrationKey.map(key => ({
      _id: key._id,
      key: decrypt(key.key),
    }));

    const responseUser = {
      ...user.toObject(),
      registrationKey: decryptedRegistrationKeys,
    };

    res.json(responseUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getUsersByAuthorityAndKey = async (req, res) => {
  try {
    const { authorityId, registrationKeyId } = req.query;

    if (!authorityId || !registrationKeyId) {
      return res.status(400).json({ message: "Faltan parámetros de búsqueda." });
    }

    const users = await User.find({
      authorities: authorityId,
      registrationKey: registrationKeyId,
      estadoEliminacion: 0 // Opcional: excluir eliminados
    })
    .populate("authorities")
    .populate("registrationKey")
    .populate("correo");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios.", error });
  }
};

// Crear un nuevo usuario
export const createUser = async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      usuario,
      correo,
      authorities,
      registrationKey,
      correoVerificacion,
      usuarioHistory,
    } = req.body;

    // Buscar o crear el Email real del usuario
    let emailDoc = await Email.findOne({ correo });
    if (!emailDoc) {
      emailDoc = await Email.create({ correo });
    }

    // Generar contraseña aleatoria y cifrarla
    const rawPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(rawPassword, salt);

    let finalAuthorities = [];
    let registrationKeysDocs = [];
    let nivelUsuario = 0;

    if (registrationKey) {
      // Usar correoVerificacion si se provee, si no usar el mismo correo del nuevo usuario
      const correoParaValidar = correoVerificacion || correo;
      const emailVerifDoc = await Email.findOne({ correo: correoParaValidar });

      if (!emailVerifDoc) {
        return res.status(400).json({ message: "No se encontró el correo de verificación" });
      }

      registrationKeysDocs = await RegistrationKey.find({ correo: emailVerifDoc._id });
      console.log("correo verigfi",emailVerifDoc._id)
console.log("registrationKey",registrationKey)
      if (!registrationKeysDocs || registrationKeysDocs.length === 0) {
        return res.status(400).json({ message: "No se encontraron claves de registro para este correo" });
      }

      // Verificar si alguna clave coincide
      const validKeyDoc = registrationKeysDocs.find((regKeyDoc) => {
        const decryptedKey = decrypt(regKeyDoc.key);
        return decryptedKey === registrationKey;
      });

      if (!validKeyDoc) {
        return res.status(400).json({ message: "Clave de registro incorrecta" });
      }

      // Obtener autoridades desde las claves de registro
      finalAuthorities = await Authority.find({
        _id: { $in: registrationKeysDocs.map((keyDoc) => keyDoc.authorities).flat() },
      });

      nivelUsuario = 1;
    } else if (authorities.length > 0) {
      const validAuthorities = await Authority.find({
        _id: { $in: authorities.map((auth) => auth.id) },
      });

      if (validAuthorities.length !== authorities.length) {
        return res.status(400).json({ message: "Algunas autoridades no son válidas" });
      }

      finalAuthorities = validAuthorities;
    }

    // Crear el nuevo usuario
    const newUser = new User({
      nombre,
      apellido,
      usuario,
      correo: emailDoc._id,
      contrasena: encryptedPassword,
      authorities: finalAuthorities.map((auth) => auth._id),
      registrationKey: registrationKeysDocs.map((keyDoc) => keyDoc._id),
      nivel: nivelUsuario,
      estadoEliminacion: 0,
    });

    await newUser.save();

    // Registrar en historial
    const historyEntry = new History({
      username: usuarioHistory || usuario,
      action: "create_user",
      datetime: new Date().toISOString(),
      nivel: nivelUsuario,
    });
    await historyEntry.save();

    // Enviar correo al nuevo usuario
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
      text: `Hola ${nombre} ${apellido},\n\nTu cuenta ha sido creada exitosamente.\nUsuario: ${usuario}\nContraseña: ${rawPassword}\n\nPor favor, cambia tu contraseña después de iniciar sesión.\nSaludos, El equipo.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(201).json({
      message: "Usuario creado exitosamente",
      user: {
        id: newUser._id,
        nombre,
        apellido,
        usuario,
        correo,
        nivel: nivelUsuario,
        registrationKeys: registrationKeysDocs.map((k) => decrypt(k.key)),
        authorities: finalAuthorities.map((auth) => auth.type),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear el usuario", error: error.message });
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

    // Verificar si el correo se ha modificado
    if (correo) {
      // Eliminar el correo anterior
      await Email.findByIdAndDelete(user.correo);

      // Crear un nuevo correo
      const newEmail = new Email({ correo: correo });
      await newEmail.save();

      // Actualizar el usuario con el nuevo correo
      user.correo = newEmail._id;
    }

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

export const loginUser = async (req, res) => {
  const { identifier, contrasena } = req.body;

  try {
    if (!identifier || !contrasena) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }

    let user;

    if (mongoose.Types.ObjectId.isValid(identifier)) {
      user = await User.findOne({
        $or: [{ correo: mongoose.Types.ObjectId(identifier) }, { usuario: identifier }],
      })
        .populate('correo')
        .populate('registrationKey')
        .populate({
          path: 'authorities',
          select: 'name type',
        });
    } else if (identifier.includes('@')) {
      const email = await Email.findOne({ correo: identifier });
      if (email) {
        user = await User.findOne({
          $or: [{ correo: email._id }, { usuario: identifier }],
        })
          .populate('correo')
          .populate('registrationKey')
          .populate({
            path: 'authorities',
            select: 'name type',
          });
      } else {
        user = await User.findOne({ usuario: identifier })
          .populate('correo')
          .populate('registrationKey')
          .populate({
            path: 'authorities',
            select: 'name type',
          });
      }
    } else {
      user = await User.findOne({ usuario: identifier })
        .populate('correo')
        .populate('registrationKey')
        .populate({
          path: 'authorities',
          select: 'name type',
        });
    }

    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    const isMatch = await bcrypt.compare(contrasena, user.contrasena);
    if (!isMatch) return res.status(401).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        correo: user.correo?.correo || null,
        usuario: user.usuario,
        nivel: user.nivel || 0,  // Si no tiene nivel, le asignamos 0 por defecto
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Solo devolvemos las autoridades del usuario (no las de registrationKey)
    const authorities = user.authorities || [];

    // Registrar en el historial si aplica
    if (user.usuario) {
      const currentDateTime = moment().format('DD/MM/YYYY HH:mm:ss');
      const historyEntry = new History({
        username: user.usuario,
        datetime: currentDateTime,
        action: 'login',
        nivel: 0,
      });
      await historyEntry.save();
    }

    res.status(200).json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        apellido: user.apellido,
        usuario: user.usuario,
        correo: user.correo?.correo || null,
        registrationKey: user.registrationKey
          ? user.registrationKey.map(reg => reg.key)
          : [],
          authorities: authorities.reduce((acc, auth) => {
            if (auth.name) acc.push(auth.name);
            if (auth.type) acc.push(auth.type);
            return acc;
          }, []),
          
        nivel: user.nivel || 0,  // Si no tiene nivel, devolvemos 0 por defecto
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor', error: error.message });
  }
};

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
    const userCount = await User.countDocuments({ nivel: 0 });
    if (userCount === 0) {
      return res.status(200).json({ usersExist: false });
    }
    res.status(200).json({ usersExist: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Registrar el primer usuario administrador
export const registerFirstAdmin = async (req, res) => {
  const { nombre, apellido, correo, usuarioHistory, autoridadId } = req.body;

  try {
    // Verificar si ya existe algún usuario en la base de datos
    const existingUser = await User.countDocuments({ nivel: 0 });
    if (existingUser > 0) {
      return res.status(400).json({ message: "Ya existe un usuario en el sistema" });
    }

    // Verificar si la autoridad de superadmin existe
    const superAdminAuthority = await Authority.findById(autoridadId);
    if (!superAdminAuthority) {
      return res.status(400).json({ message: "La autoridad proporcionada no existe" });
    }

    // Verificar si el correo ya existe en la colección de Email
    let email = await Email.findOne({ correo });
    if (!email) {
      // Si el correo no existe, creamos un nuevo documento en la colección de Email
      email = new Email({ correo });
      await email.save();
    }

    const randomPassword = crypto.randomBytes(8).toString("hex");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(randomPassword, salt);

    // Crear el usuario con la autoridad de superadmin
    const user = new User({
      nombre,
      apellido,  // Aseguramos que el apellido se registre correctamente
      correo: email._id, // Asignamos el ObjectId de correo desde la colección Email
      usuario: req.body.usuario,
      contrasena: hashedPassword,
      authorities: [superAdminAuthority._id], // Asignamos la autoridad de superadmin
      estadoEliminacion: 0, // Aseguramos que el usuario no esté eliminado
      nivel: 0, // Asignamos el nivel de superadmin
    });

    const newUser = await user.save();

    // Registrar la acción de creación del primer superadmin en el historial
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: req.body.usuario,  // El usuario que está creando al superadmin
      datetime: currentDateTime,
      action: "register_first_admin", // Acción de registrar el primer superadmin
      nivel: 0,
      description: `Se ha registrado el primer superadmin con el nombre de usuario ${req.body.usuario}`, // Descripción
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
      text: `Hola ${nombre} ${apellido},\n\nTu cuenta de superadmin ha sido creada exitosamente.\nUsuario: ${req.body.usuario}\nContraseña: ${randomPassword}\n\nPor favor, cambia tu contraseña después de iniciar sesión.\nSaludos, El equipo.`,
    };

    await transporter.sendMail(mailOptions);

    // Responder con el nuevo usuario creado
    const userWithAuthorities = await User.findById(newUser._id).populate("authorities");

    res.status(201).json({
      message: "Primer usuario administrador registrado exitosamente",
      user: userWithAuthorities,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Eliminar todos los usuarios de la base de datos
export const deleteUsersCleanSlate = async (req, res) => {
  const { usuarioHistory } = req.body; // Usuario que realiza la acción

  try {
    // Eliminar todos los usuarios
    const result = await User.deleteMany({});
    
    // Registrar la acción en el historial
    const currentDateTime = moment().format("DD/MM/YYYY HH:mm:ss");
    const historyEntry = new History({
      username: usuarioHistory, // Usuario que realiza la acción
      datetime: currentDateTime,
      action: "delete_all_users", // Acción realizada
      description: `El usuario ${usuarioHistory} eliminó todos los usuarios de la base de datos.`,
      nivel: 1, // Nivel de importancia
    });
    await historyEntry.save();

    res.status(200).json({
      message: "Todos los usuarios han sido eliminados exitosamente.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar los usuarios", error: error.message });
  }
};
