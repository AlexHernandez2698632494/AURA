import Device from "../../models/iotagent/devices.models.js";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Function to handle the creation of devices
export const createDevice = async (req, res) => {   
    try {
         // Extraer los valores de los encabezados
         const { 'fiware-service': service, 'fiware-servicepath': subservice } = req.headers;

         // Extraer el cuerpo de la solicitud
         const { devices } = req.body;
 
         // Validar que los datos necesarios estén presentes
         if (!service || !subservice || !devices || devices.length === 0) {
             return res.status(400).json({ message: 'Missing required data' });
         }
 
         // Crear un nuevo objeto de dispositivo a partir de los datos
         const deviceData = new Device({
             id: devices[0].device_id,
             name: devices[0].entity_name,
             type: devices[0].entity_type,
             timezone: devices[0].timezone,
             protocol: devices[0].protocol,
             transport: devices[0].transport,
             apikey: devices[0].apikey,
             address: devices[0].address,
             location: devices[0].location,
             attributes: devices[0].attributes,
             service: service, // Extraído de los headers
             subservice: subservice, // Extraído de los headers
         });
 
         // Guardar el dispositivo en la base de datos
         await deviceData.save();
 
         // Responder con éxito
         res.status(201).json({ message: 'Device created successfully', data: deviceData });
     } catch (error) {
         console.error(error);
         res.status(500).json({ message: 'Error creating device', error: error.message });
     }
 };