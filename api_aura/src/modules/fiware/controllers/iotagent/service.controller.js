import axios from "axios";
import yaml from "js-yaml";
import { url_json } from "../../../../utils/Github.utils.js";

  export const registerService = async(req, res) => {
    try {
        const { 'fiware-service': fiware_service, 'fiware-servicepath': fiware_servicepath } = req.headers;
        const body = req.body;

        // Verificar que los headers requeridos estén presentes
        if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Headers fiware-service y fiware-servicepath son requeridos' });
        }

        // Hacer la solicitud POST al servidor de servicios
        const response = await axios.post(`${url_json}iot/services`, body, {
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

        // Construir la URL para la eliminación, que incluirá los parámetros apikey y resource
        const urlToDelete = `${url_json}services?apikey=${apikey}&resource=${encodeURIComponent(resource)}`;

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