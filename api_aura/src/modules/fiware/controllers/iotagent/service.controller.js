import axios from "axios";
import yaml from "js-yaml";
import feth from "node-fetch"

const CONFIG_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/AURA/refs/heads/master/api_aura/src/modules/config/ngsi.api.service.yml";

// Función para obtener la URL del servicio de la configuración
async function getConfig() {
    const response = await fetch(CONFIG_URL);
    const text = await response.text();
    const config = yaml.load(text);
    return config.sensors.url_json;
}

  export const registerService = async(req, res) => {
    try {
        const { 'fiware-service': fiware_service, 'fiware-servicepath': fiware_servicepath } = req.headers;
        const body = req.body;

        // Verificar que los headers requeridos estén presentes
        if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Headers fiware-service y fiware-servicepath son requeridos' });
        }

        // Obtener la URL desde la configuración (debería ser HTTP en este caso)
        const url_json = await getConfig();

        // Cambiar la URL de HTTPS a HTTP, si la API en localhost está usando HTTP
        const apiUrl = url_json.replace("https://", "http://");

        // Hacer la solicitud POST al servidor de servicios
        const response = await axios.post(`${apiUrl}iot/services`, body, {
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': fiware_service,
                'fiware-servicepath': fiware_servicepath
            }
        });

        // Responder con el resultado
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error al crear el servicio:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al comunicarse con el Agente IoT',
            details: error.response?.data || error.message
        });
    }
}   

export const deleteService = async (req, res) => {
    try {
        // Obtener los parámetros de la URL (query params)
        const { apikey, resource } = req.query;

        // Obtener los headers de la solicitud
        const { 'fiware-service': fiware_service, 'fiware-servicepath': fiware_servicepath } = req.headers;

         // Verificar que los headers requeridos estén presentes
         if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Headers fiware-service y fiware-servicepath son requeridos' });
        }
        if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Los headers fiware-service y fiware-servicepath son requeridos' });
        }

        // Asegurarse de que 'resource' no esté vacío
        if (resource.trim() === '') {
            return res.status(400).json({ error: 'El parámetro "resource" no puede estar vacío' });
        }

        // Obtener la URL desde la configuración
        const url_json = await getConfig();

        // Cambiar la URL de HTTPS a HTTP si es necesario
        const apiUrl = url_json.replace("https://", "http://");

        // Construir la URL para la eliminación, que incluirá los parámetros apikey y resource
        const urlToDelete = `${apiUrl}services?apikey=${apikey}&resource=${encodeURIComponent(resource)}`;

        // Hacer la solicitud DELETE al servidor de servicios
        const response = await axios.delete(urlToDelete, {
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': fiware_service,
                'fiware-servicepath': fiware_servicepath
            }
        });

        // Responder con el resultado
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error al eliminar el servicio:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al comunicarse con el Agente IoT',
            details: error.response?.data || error.message
        });
    }
}