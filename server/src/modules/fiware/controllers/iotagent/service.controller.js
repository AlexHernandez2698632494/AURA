import axios from "axios";
import yaml from "js-yaml";
import feth from "node-fetch"

const CONFIG_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

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
        const response = await axios.post(`${apiUrl}services`, body, {
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