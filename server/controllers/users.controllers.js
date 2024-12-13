import { User } from "../models/users.models.js";
import  bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'
import crypto from 'crypto'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  const { nombre, correo, usuario } = req.body;

  // Generar contraseña aleatoria (16 caracteres)
  const randomPassword = crypto.randomBytes(8).toString('hex');  // Genera 16 caracteres

  // Encriptar la contraseña generada
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(randomPassword, salt);

  // Crear el usuario con la contraseña encriptada
  const user = new User({ nombre, correo, usuario, contrasena: hashedPassword });

  try {
    // Guardar el usuario en la base de datos
    const newUser = await user.save();

    // Configurar el transportador de nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Correo desde las variables de entorno
        pass: process.env.EMAIL_PASS, // Contraseña de aplicación desde las variables de entorno
      },
    });

    // Configurar el contenido del correo
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: correo,
      subject: 'Registro exitoso',
      text: `Hola ${nombre},\n\nTu cuenta ha sido creada exitosamente.\n\nDetalles de acceso:\nUsuario: ${usuario}\nContraseña: ${randomPassword}\n\nPor favor, cambia tu contraseña después de iniciar sesión.\n\nSaludos,\nEl equipo`,
    };

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    // Responder con éxito
    res.status(201).json({ message: 'Usuario creado y correo enviado', user: newUser });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true, // Devuelve el documento actualizado
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const loginUser = async (req, res) => {
  const { identifier, contrasena } = req.body;

  try {
    // Buscar usuario por correo o nombre de usuario
    const user = await User.findOne({
      $or: [{ correo: identifier }, { usuario: identifier }],
    });

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(contrasena, user.contrasena);

    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    // Generar respuesta en caso de éxito
    res.status(200).json({
      message: "Inicio de sesión exitoso",
      user: {
        id: user._id,
        nombre: user.nombre,
        correo: user.correo,
        usuario: user.usuario,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
