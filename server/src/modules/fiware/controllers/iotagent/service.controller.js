import axios from 'axios';
import mongoose from 'mongoose';
import Service from '../../models/iotagent/service.models.js';

const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

//funcion para obtener la url del iotangente desde el yml
const getIotAgentURL = async () => {
    try {
        const response = await fetch(MAPPING_YML_URL);
        if (!response.ok) throw new Error("Error al obtener el archivo YML");
        const text = await response.text();
        const match = text.match(/url_json: \s*["']?(.*?)["']?/);
        return match ? match[1] : null;
    } catch (error) {
        console.error("Error obteniendo el archivo YML:", error);
        return {};
    }
};

export const createService = async (req, res) => {
    let mongoConnection = null;
    try {
        const IOT_AGENT_URL = await getIotAgentURL();
        if (!IOT_AGENT_URL) {
            return res.status(500).json({ message: "Error al obtener la URL del IoT Agent" });
        };
        const { apikey, cbroker, entity_type, resource } = req.body;
        const service = req.headers['fiware-service'] || 'default';
        const subservice = req.headers['fiware-servicepath'] || '/';
        if (!service || !subservice) {
            return res.status(400).json({ message: "Debe enviar los headers 'fiware-service' y 'fiware-servicepath'" });
        }

        //datos al envias al IoT Agent
        const requestData = { services: [{ apikey, cbroker, resource, entity_type }] };

        //envio de datos al IoT Agent
        const response = await axios.post(`${IOT_AGENT_URL}services`, requestData, {
            headers: {
                'Fiware-Service': service,
                'Fiware-ServicePath': subservice
            }
        });

        //abrir conexion a mongo
        mongoConnection = await mongoose.connect(process.env.MONGO_URI_IoT_Device, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        //guardar en mongo
        const newService = new Service({ apikey, cbroker, entity_type, resource, service, subservice });
        await newService.save();
        return res.status(201).json({ message: 'servicio creado correctamente', data: response.data });
    }
    catch (error) {
        console.error("Error al crear el servicio:", error);
        res.status(500).json({ error: "Error al crear el servicio", details: error.message });
    }
    finally {
        if (mongoConnection) await mongoose.connection.close();
        console.log("Conexion a mongo cerrada");
    }
}