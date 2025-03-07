import axios from 'axios';
import yaml from 'js-yaml';
import Alert from "../models/Alert.models.js";
import Device from "../models/iotagent/devices.models.js";

const ORION_BASE_URL = "https://orion.sima.udb.edu.sv/v2/";
const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

const getSensorMapping = async () => {
    try {
        const response = await axios.get(MAPPING_YML_URL);
        const ymlData = yaml.load(response.data);
        const mappings = ymlData.mappings;

        const sensorMapping = {};
        for (const [label, data] of Object.entries(mappings)) {
            const cleanLabel = label.replace(/[\[\]]/g, '').trim();
            data.alias.forEach(alias => {
                sensorMapping[alias] = { label: cleanLabel, unit: data.unit };
            });
        }

        return sensorMapping;
    } catch (error) {
        console.error("Error obteniendo el archivo YML:", error);
        return {};
    }
};

const getEntities = async (headers, params) => {
    const url = `${ORION_BASE_URL}entities`;
    const response = await axios.get(url, { headers, params });
    return response.data;
};

const getAlerts = async () => {
    const alerts = await Alert.find({ estadoEliminacion: 0 });
    return alerts;
};

export const getEntitiesWithAlerts = async (req, res) => {
  try {
      // Verificar si los headers necesarios están presentes
      if (!req.headers['fiware-service']) {
          return res.status(400).json({
              message: 'Faltan los headers requeridos: Fiware-Service.'
          });
      }else if (!req.headers['fiware-servicepath']) {
          return res.status(400).json({ message: 'Faltan los headers requeridos: Fiware-ServicePath.' });
      }

      const headers = {
          'Fiware-Service': req.headers['fiware-service'] || 'sv',
          'Fiware-ServicePath': req.headers['fiware-servicepath'] || '/'
      };

      const params = {
          type: req.query.type || undefined,
          limit: req.query.limit || 100
      };

      const sensorMapping = await getSensorMapping();
      const entities = await getEntities(headers, params);
      const alerts = await getAlerts();

      const combinedData = entities.map(entity => {
          const variables = entity.sensors?.value ? 
              Object.entries(entity.sensors.value).map(([key, value]) => {
                  const mappedData = sensorMapping[key] || { label: key, unit: '' };
                  const alert = alerts.find(alert => alert.variable === mappedData.label && value >= alert.initialRange && value <= alert.finalRange);
                  return {
                      name: mappedData.label,
                      value: `${value} ${mappedData.unit}`, // Combine value with its unit
                      alert: alert ? {
                          name: alert.displayName,
                          color: alert.color,
                          level: alert.level
                      } : undefined
                  };
              }) : [];

          // Determinar el nivel más alto y el color correspondiente
          const highestAlert = variables.reduce((max, variable) => {
              if (variable.alert && (!max || variable.alert.level > max.level)) {
                  return variable.alert;
              }
              return max;
          }, null);

          return {
              id: entity.id,
              type: entity.type,
              location: entity.location,
              externalUri: entity.externalUri,
              color: highestAlert ? highestAlert.color : undefined,
              level: highestAlert ? highestAlert.level : undefined,
              variables,
              timeInstant: entity.timeInstant
          };
      });

      res.json(combinedData);
  } catch (error) {
      console.error("Error obteniendo datos combinados:", error);
      res.status(500).json({ message: 'Error al obtener datos combinados.' });
  }
};


export const getSubService = async (req, res) => {
    try {
      const service = req.headers['fiware-service'];
  
      if (!service) {
        return res.status(400).json({ error: "El header fiware-service es requerido" });
      }
  
      // Buscar los dispositivos que pertenecen al servicio especificado
      const devices = await Device.find({ service });
  
      if (!devices || devices.length === 0) {
        return res.status(404).json({ error: `No se encontraron dispositivos para el servicio ${service}` });
      }
  
      // Usamos un objeto para agrupar las coordenadas por subservicio, evitando duplicados
      const subservicesMap = {};
  
      devices.forEach(device => {
        const subservice = device.subservice;  // Obtener el subservicio
        const coordinates = device.location?.value?.coordinates;  // Obtener las coordenadas
  
        if (coordinates && coordinates.length >= 2) {
          // Si no existe el subservicio en el mapa, lo agregamos con sus coordenadas
          if (!subservicesMap[subservice]) {
            subservicesMap[subservice] = {
              subservice, // Almacenamos el subservicio
              latitude: coordinates[0],
              longitude: coordinates[1],
            };
          }
        } else {
          // Si no hay coordenadas, también se agrega, pero con null
          if (!subservicesMap[subservice]) {
            subservicesMap[subservice] = {
              subservice,
              latitude: null,
              longitude: null,
            };
          }
        }
      });
  
      // Convertimos el mapa a una lista
      const subservices = Object.values(subservicesMap);
  
      // Ordenamos los subservicios alfabéticamente por nombre de subservicio en orden ascendente
      subservices.sort((a, b) => a.subservice.localeCompare(b.subservice));
  
      // Devolver la respuesta con subservicios y sus ubicaciones
      return res.json(subservices);
  
    } catch (error) {
      console.error("Error al obtener subservicios:", error);
      return res.status(500).json({
        error: "Hubo un problema al obtener los subservicios.",
      });
    }
};

  
// export const getSubService = async (req, res) => {
//     try {
//         const service = req.headers['fiware-service'] || 'sv';

//         if(!service){
//             return res.status(400).json({error: "the header fiware-service is required"});
//         }

//         // Buscar los dispositivos que pertenecen al servicio especificado
//         const devices = await Device.find({ service });

//         if(!devices || devices.length === 0){
//             return res.status(404).json({error: `No devices found for service ${service}`});
//         }

//         const subservices = [...new Set(devices.map((device) => device.subservice))];

//         // Devolver los subservicios tal como están en la base de datos
//         return res.json(subservices);

//   } catch (error) {
//     console.error("Error al obtener subservicios:", error);
//     return res.status(500).json({
//       error: "Hubo un problema al obtener los subservicios.",
//     });
//   }
// };