import axios from "axios";
import yaml from "js-yaml";
import { url_json } from "../../../../utils/Github.utils.js";

// Function to handle the creation of devices
export const createDevice = async(req, res) => {
    try{
        const { 'fiware-service': fiware_service, 'fiware-servicepath': fiware_servicepath } = req.headers;
        const body = req.body;

        // Verificar que los headers requeridos estén presentes
        if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Headers fiware-service y fiware-servicepath son requeridos' });
        }

        //hacer la solicitud POST al servidor de dispositivos
        const response = await axios.post(`${url_json}devices`, body, {
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
// export const createDevice = async (req, res) => {   
//     try {
//          const { 'fiware-service': service, 'fiware-servicepath': subservice } = req.headers;

//          const { devices } = req.body;
 
//          if (!service || !subservice || !devices || devices.length === 0) {
//              return res.status(400).json({ message: 'Missing required data' });
//          }
 
//          const deviceData = new Device({
//              id: devices[0].device_id,
//              name: devices[0].entity_name,
//              type: devices[0].entity_type,
//              timezone: devices[0].timezone,
//              protocol: devices[0].protocol,
//              transport: devices[0].transport,
//              apikey: devices[0].apikey,
//              address: devices[0].address,
//              location: devices[0].location,
//              attributes: devices[0].attributes,
//              service: service, 
//              subservice: subservice,
//          });
 
//          await deviceData.save();
 
//          res.status(201).json({ message: 'Device created successfully', data: deviceData });
//      } catch (error) {
//          console.error(error);
//          res.status(500).json({ message: 'Error creating device', error: error.message });
//      }
//  };

export const getDevicesbyId = async(req, res) => {
    try {
        const { 'fiware-service': fiware_service, 'fiware-servicepath': fiware_servicepath } = req.headers;
        const { deviceId } = req.params; // Obtenemos el ID del dispositivo desde los parámetros de la URL

        // Verificar que los headers requeridos estén presentes
        if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Headers fiware-service y fiware-servicepath son requeridos' });
        }

        // Verificar que el ID del dispositivo esté presente
        if (!deviceId) {
            return res.status(400).json({ error: 'ID del dispositivo es requerido' });
        }

        // Hacer la solicitud GET al servidor de dispositivos
        const response = await axios.get(`${url_json}iot/devices/${deviceId}`, {
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': fiware_service,
                'fiware-servicepath': fiware_servicepath
            }
        });

        // Responder con el resultado
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error al obtener el dispositivo:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al comunicarse con el Agente IoT',
            details: error.response?.data || error.message
        });
    }
}
export const deleteDevice = async(req, res) => {
    try {
        const { 'fiware-service': fiware_service, 'fiware-servicepath': fiware_servicepath } = req.headers;
        const { deviceId } = req.params; // Obtenemos el ID del dispositivo desde los parámetros de la URL

        // Verificar que los headers requeridos estén presentes
        if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Headers fiware-service y fiware-servicepath son requeridos' });
        }

        // Verificar que el ID del dispositivo esté presente
        if (!deviceId) {
            return res.status(400).json({ error: 'ID del dispositivo es requerido' });
        }


        // Hacer la solicitud DELETE al servidor de dispositivos
        const response = await axios.delete(`${url_json}iot/devices/${deviceId}`, {
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': fiware_service,
                'fiware-servicepath': fiware_servicepath
            }
        });

        // Responder con el resultado
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error('Error al eliminar el dispositivo:', error.message);
        res.status(error.response?.status || 500).json({
            error: 'Error al comunicarse con el Agente IoT',
            details: error.response?.data || error.message
        });
    }
}
