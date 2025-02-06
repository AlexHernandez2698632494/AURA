import { Authority } from "../models/authorities.models.js";
import { History } from "../models/history.models.js";
import { RegistrationKey } from "../models/registrationKey.models.js";
import { Email } from "../models/emails.models.js";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import moment from "moment";

// Función para generar la clave en el formato XXXX-XXXX-XXXX-XXXX (solo mayúsculas y números)
function generateActivationKey() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // Solo mayúsculas y números
  let key = "";

  for (let i = 0; i < 4; i++) {
    let block = "";
    for (let j = 0; j < 4; j++) {
      const randomChar = characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
      block += randomChar;
    }
    key += block + (i < 3 ? "-" : ""); // Agregar el guion excepto al final
  }
  return key;
}

export const createAuthorityKey = async (req, res) => {
  try {
    const { type, email, planType, duration, usuarioHistory } = req.body; // Obtener los datos de la solicitud

    // Paso 1: Crear la autoridad
    const authority = new Authority({
      name: "super_usuario", // Nombre por defecto
      type: type,
    });
    await authority.save();

    // Paso 2: Registrar el correo
    const emailExists = await Email.findOne({ correo: email });
    let emailDoc;
    if (!emailExists) {
      emailDoc = new Email({ correo: email });
      await emailDoc.save();
    } else {
      emailDoc = emailExists;
    }

    // Paso 3: Generar la clave de activación
    const key = generateActivationKey(); // Genera la clave en el formato XXXX-XXXX-XXXX-XXXX

    // Cifrar la clave con bcrypt
    const hashedKey = await bcrypt.hash(key, 10);

// Paso 4: Crear la entrada de la clave de registro
const registrationKey = new RegistrationKey({
  key: hashedKey,
  planType,
  duration,
  correo: emailDoc._id,
  authorities: [authority._id],
});

// Calcular la fecha de expiración
const currentDate = new Date();  // Fecha actual

switch (planType) {
  case 'free':
      // 30 días de prueba
      currentDate.setDate(currentDate.getDate() + 30); // Sumar 30 días exactos
      registrationKey.expiresAt = currentDate;
      break;

  case 'limit':
      // Plan ilimitado, sin expiración
      registrationKey.expiresAt = null;  // Sin fecha de expiración
      break;

  case 'month':
      // Sumar el número de meses especificado
      currentDate.setMonth(currentDate.getMonth() + duration);  // Sumar los meses

      // Verificar si la fecha del mes de destino es válida (ej. 31 de febrero no existe)
      if (currentDate.getDate() !== currentDate.getDate()) {
          // Ajustar al último día del mes
          currentDate.setDate(0); // Esto pone la fecha al último día del mes anterior
      }

      registrationKey.expiresAt = currentDate;
      break;

  case 'year':
      // Sumar el número de años especificado
      currentDate.setFullYear(currentDate.getFullYear() + duration);  // Sumar los años

      // Verificar si la fecha del año de destino es válida (ej. 29 de febrero en un año no bisiesto)
      if (currentDate.getDate() !== currentDate.getDate()) {
          // Ajustar al último día del mes
          currentDate.setDate(0); // Esto pone la fecha al último día del mes anterior
      }

      registrationKey.expiresAt = currentDate;
      break;

  default:
      registrationKey.expiresAt = null;
      break;
}

await registrationKey.save();


    // Paso 5: Registrar en el historial
    const currentDateTime = moment().format("DD/MM/YYYY");
    const historyEntry = new History({
      username: usuarioHistory, // Asumiendo que el usuario que hace la solicitud está en `req.user`
      datetime: currentDateTime,
      action: "create_authority",
      nivel: 0,
    });
    await historyEntry.save();

    // Paso 6: Enviar el correo
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const planMessage =
      planType === "free"
        ? "¡Felicidades! Has seleccionado el plan Free. Disfruta de los beneficios limitados y, si deseas más, puedes actualizar a un plan superior más tarde."
        : "¡Gracias por elegir el plan Ilimitado! Disfruta de acceso sin restricciones y todas las funciones avanzadas de SIMATI.";

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Asunto relacionado al envío de licencia SIMATI",
      html: `
              <div style="text-align: center;">
                  ${
                    planType === "free" || planType === "ilimitado"
                      ? ""
                      : '<img src="https://raw.githubusercontent.com/AlexHernandez2698632494/pictures/655daf80390e1fab2574ced7f2ef22441a843f6b/SIMATI/650x231.jpg" alt="Imagen de referencia" style="max-width: 100%; height: auto;"/>'
                  }
                  <p style="font-size: 16px; color: #333; margin-top: 20px;">
                      Para activar tu producto debes ingresar al sitio web <a href="https://simati.udb.edu.sv" target="_blank" style="color: #007bff;">simati.udb.edu.sv</a>, ingresar a <strong>Registrarse</strong> y sigue el paso a paso para su activación.
                  </p>

                  <p style="font-size: 16px; color: #333; margin-top: 20px;">
                      ${planMessage}
                  </p>

                  <div style="background-color: #007bff; color: white; padding: 10px; font-size: 18px; margin-top: 20px; border-radius: 5px; display: inline-block;">
                      Código de activación: <strong>${key}</strong>  <!-- Aquí se envía la clave sin cifrar -->
                  </div>
              </div>
          `,
    };

    await transporter.sendMail(mailOptions);

    // Responder con éxito
    return res.status(200).json({
      message: "Autoridad creada y clave enviada con éxito.",
      data: { authority, registrationKey },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Error al crear la autoridad.", error: error.message });
  }
};
