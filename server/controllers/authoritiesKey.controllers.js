import { Authority } from "../models/authorities.models.js";
import { History } from "../models/history.models.js";
import { RegistrationKey } from "../models/registrationKey.models.js";
import { Email } from "../models/emails.models.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import moment from "moment";

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


// Función para generar la clave en el formato XXXX-XXXX-XXXX-XXXX (solo mayúsculas y números)
function generateActivationKey() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";

  for (let i = 0; i < 4; i++) {
    let block = "";
    for (let j = 0; j < 4; j++) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      block += randomChar;
    }
    key += block + (i < 3 ? "-" : "");
  }
  return key;
}

export const createAuthorityKey = async (req, res) => {
  try {
    const { type, email, planType, duration, usuarioHistory } = req.body;
    
    const authority = new Authority({ name: "super_usuario", type });
    await authority.save();

    const emailExists = await Email.findOne({ correo: email });
    let emailDoc = emailExists || await new Email({ correo: email }).save();

    const key = generateActivationKey();
    const encryptedKey = encrypt(key);

    const registrationKey = new RegistrationKey({
      key: encryptedKey,
      planType,
      duration,
      correo: emailDoc._id,
      authorities: [authority._id],
    });

    const currentDate = new Date();
    switch (planType) {
      case 'free':
          currentDate.setDate(currentDate.getDate() + 30);
          registrationKey.expiresAt = currentDate;
          break;
      case 'month':
          currentDate.setMonth(currentDate.getMonth() + duration);
          registrationKey.expiresAt = currentDate;
          break;
      case 'year':
          currentDate.setFullYear(currentDate.getFullYear() + duration);
          registrationKey.expiresAt = currentDate;
          break;
      default:
          registrationKey.expiresAt = null;
          break;
    }

    await registrationKey.save();

    const historyEntry = new History({
      username: usuarioHistory,
      datetime: moment().format("DD/MM/YYYY"),
      action: "create_authority",
      nivel: 0,
    });
    await historyEntry.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    const planMessage =
      planType === "free" ?
      "¡Felicidades! Has seleccionado el plan Free. Disfruta de los beneficios limitados y, si deseas más, puedes actualizar a un plan superior más tarde." :
      "¡Gracias por elegir el plan Ilimitado! Disfruta de acceso sin restricciones y todas las funciones avanzadas de SIMATI.";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Asunto relacionado al envío de licencia SIMATI",
      html: `
              <div style="text-align: center;">
                  <p style="font-size: 16px; color: #333; margin-top: 20px;">
                      Para activar tu producto debes ingresar al sitio web <a href="https://simati.udb.edu.sv" target="_blank" style="color: #007bff;">simati.udb.edu.sv</a>, ingresar a <strong>Registrarse</strong> y sigue el paso a paso para su activación.
                  </p>
                  <p style="font-size: 16px; color: #333; margin-top: 20px;">
                      ${planMessage}
                  </p>
                  <div style="background-color: #007bff; color: white; padding: 10px; font-size: 18px; margin-top: 20px; border-radius: 5px; display: inline-block;">
                      Código de activación: <strong>${key}</strong>
                  </div>
              </div>
          `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: "Autoridad creada y clave enviada con éxito.", data: { authority, registrationKey } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error al crear la autoridad.", error: error.message });
  }
};
