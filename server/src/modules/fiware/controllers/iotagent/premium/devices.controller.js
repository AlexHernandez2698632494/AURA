import axios from "axios";
import yaml from "js-yaml";
import fetch from "node-fetch";
import Fiware from "../../../models/fiware.models.js";

const CONFIG_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

// Función para obtener la URL del servicio de la configuración
async function getConfig() {
    const response = await fetch(CONFIG_URL);
    const text = await response.text();
    const config = yaml.load(text);
    return config.sensors.url_json;
}

export const createServiceDeviceJSON = async (req, res) => {
    try {
        const { apikey, entity_type } = req.body;
        const fiware_service = req.headers["fiware-service"];
        const fiware_servicepath = req.headers["fiware-servicepath"];
        
        if (!apikey || !fiware_service || !fiware_servicepath) {
            return res.status(400).json({ message: "Faltan parámetros requeridos." });
        }
        
        const url_json = await getConfig();
        const apiUrl = url_json.replace("https://", "http://");
        
        // Validación 1: Verificar si la API key ya existe en los servicios
        const { data } = await axios.get(`${apiUrl}services`, {
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': fiware_service,
                'fiware-servicepath': fiware_servicepath
            }
        });
        
        const serviceExists = data.services.some(service => service.apikey === apikey);
        if (serviceExists) {
            return res.status(400).json({ message: "El apikey ya existe en el servicio." });
        }

        // Validación 2: Verificar si la API key ya existe en los servicios recuperando fiware_service, fiware_servicepath desde la base de datos Fiware
        const fiwareRecords = await Fiware.find();
        for (const record of fiwareRecords) {
            const { data } = await axios.get(`${apiUrl}services`, {
                headers: {
                    'Content-Type': 'application/json',
                    'fiware-service': record.fiware_service,
                    'fiware-servicepath': record.fiware_servicepath
                }
            });
            const existsInDbService = data.services.some(service => service.apikey === apikey);
            if (existsInDbService) {
                return res.status(400).json({ message: "No se puede crear el servicio, apikey ya registrada en la base de datos." });
            }
        }

        // Validación 3: Crear el servicio si no existe
        const serviceBody = {
            services: [
                {
                    apikey,
                    cbroker: "http://orion:1026",
                    entity_type,
                    resource: "/iot/json"
                }
            ]
        };

        await axios.post(`${apiUrl}services`, serviceBody, {
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': fiware_service,
                'fiware-servicepath': fiware_servicepath
            }
        });
        
        return res.status(201).json({ message: "Servicio creado exitosamente." });
        
    } catch (error) {
        return res.status(500).json({ message: "Error en el servidor", error: error.message });
    }
};
