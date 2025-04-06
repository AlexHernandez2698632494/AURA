import axios from 'axios';
import yaml from 'js-yaml';
import Alert from "../models/Alert.models.js";
import mongoose from 'mongoose';
import { connectOrionDB } from '../../../config/db.js';
import Fiware from '../models/fiware.models.js';
import FiwareBuilding from '../models/fiwareBuilding.models.js';
import building from "../models/building.models.js"; 

const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

// Función para obtener la URL del servicio de la configuración
async function getConfig() {
    const response = await fetch(MAPPING_YML_URL);
    const text = await response.text();
    const config = yaml.load(text);
    return config.sensors; // Devuelve la configuración de los sensores, que incluye la URL de Orion
}

// Aquí es donde obtienes la configuración
const config = await getConfig();

// Ahora puedes usar config.url_orion
const url_orion = config.url_orion;

// Cambia https:// a http:// para la URL base de Orion
const ORION_BASE_URL = url_orion.replace("https://", "http://");
//const ORION_BASE_URL = "https://orion.sima.udb.edu.sv/v2/"
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

// Ruta para obtener los 'servicepath' de las entidades
export const getServicePaths = async (req, res) => {
  try {
    const fiwareService = req.headers['fiware-service'];
    if (!fiwareService) {
      return res.status(400).json({ error: 'El header fiware-service es requerido' });
    }

    // Conectar a la base de datos de Orion usando el fiwareService (MongoDB nativo)
    const connection = await connectOrionDB(fiwareService);
    const db = connection.db();
    const entitiesCollection = db.collection('entities');

    // Obtenemos solo los campos necesarios: "_id.servicePath"
    const entitiesCursor = entitiesCollection.find({}, { projection: { "_id.servicePath": 1 } });
    const entities = await entitiesCursor.toArray();

    // Extraemos todos los servicePath
    const servicePaths = entities.map(ent => ent._id.servicePath);

    // Eliminamos duplicados usando Set
    const uniqueServicePaths = [...new Set(servicePaths)];

    // Devolvemos solo la lista de servicePath únicos
    res.status(200).json(uniqueServicePaths);
  } catch (error) {
    console.error('❌ Error al obtener los servicePath:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubServiceBuilding = async (req, res) => {
  try {
      const service = req.headers['fiware-service'];

      if (!service) {
          return res.status(400).json({ error: "El header fiware-service es requerido" });
      }

      const buildings = await FiwareBuilding.find({ fiware_service: service });

      if (!buildings || buildings.length === 0) {
          return res.status(404).json({ error: `No se encontraron servicepaths para el servicio ${service}` });
      }

      const subservices = await Promise.all(buildings.map(async (fiwareBuilding) => {
          try {
              const buildingName = fiwareBuilding.fiware_servicepath.replace(/_/g, ' ');
              const buildingData = await building.findOne({ nombre: buildingName });
              return {
                  subservice: fiwareBuilding.fiware_servicepath,
                  location: buildingData ? buildingData.localizacion : null,
                  name:buildingData ? buildingData.nombre : null,
                  nivel:buildingData ? buildingData.nivel : null
              };
          } catch (err) {
              console.error(`Error al buscar el edificio ${fiwareBuilding.fiware_servicepath}:`, err);
              return { subservice: fiwareBuilding.fiware_servicepath, location: null };
          }
      }));

      subservices.sort((a, b) => a.subservice.localeCompare(b.subservice));

      return res.json(subservices);
  } catch (error) {
      console.error("Error al obtener subservicios de edificios:", error);
      return res.status(500).json({ error: "Hubo un problema al obtener los subservicios de edificios." });
  }
};

export const getSubServiceBranch = async (req, res) => {
  try {
      const service = req.headers['fiware-service'];
      const serviceBuilding = req.headers['fiware-service-building'];

      if (!service || !serviceBuilding) {
          return res.status(400).json({ error: "Los headers fiware-service y fiware-service-building son requeridos" });
      }

      const branches = await Fiware.find({ fiware_service: service, fiware_service_building: serviceBuilding });

      if (!branches || branches.length === 0) {
          return res.status(404).json({ error: `No se encontraron servicepaths para el servicio ${service} y el edificio ${serviceBuilding}` });
      }

      const subservices = branches.map(branch => ({ subservice: branch.fiware_servicepath }));
      subservices.sort((a, b) => a.subservice.localeCompare(b.subservice));

      return res.json(subservices);
  } catch (error) {
      console.error("Error al obtener subservicios de sucursales:", error);
      return res.status(500).json({ error: "Hubo un problema al obtener los subservicios de sucursales." });
  }
};

export const getEntitiesWithAlerts = async (req, res) => {
    try {
        // Verificar si los headers necesarios están presentes
        if (!req.headers['fiware-service']) {
            return res.status(400).json({
                message: 'Faltan los headers requeridos: Fiware-Service.'
            });
        } else if (!req.headers['fiware-servicepath']) {
            return res.status(400).json({ message: 'Faltan los headers requeridos: Fiware-ServicePath.' });
        }
  
        const headers = {
            'Fiware-Service': req.headers['fiware-service'],
            'Fiware-ServicePath': req.headers['fiware-servicepath']
        };
  
        const params = {
            type: req.query.type || undefined,
            limit: req.query.limit || 100
        };
  
        const sensorMapping = await getSensorMapping();
        const entities = await getEntities(headers, params);
        const alerts = await getAlerts();
        const color = "#fff";
  
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
                color: highestAlert ? highestAlert.color : color,
                level: highestAlert ? highestAlert.level : undefined,
                variables,
                timeInstant: entity.timeInstant,
                deviceName: entity.deviceName?.value, // Añadir deviceName
                deviceType: entity.deviceType?.value  // Añadir deviceType
            };
        });
  
        res.json(combinedData);
    } catch (error) {
        console.error("Error obteniendo datos combinados:", error);
        res.status(500).json({ message: 'Error al obtener datos combinados.' });
    }
  };
  
export const sendDataToAgent = async (req, res) => {
  try {
    // Extrayendo los parámetros, headers y body de la solicitud
    const { k, i } = req.query; // Parámetros k e i
    const { fiware_service, fiware_servicepath } = req.headers; // Headers fiware-service y fiware-servicepath
    const body = req.body; // Body de la solicitud

    // URL del agente (puerto 7896)
    const url_json = config.url_mqtt;
    const apiUrl = url_json.replace("https://", "http://"); // Aseguramos que use http

    // Enviamos la solicitud al agente en el puerto 7896
    const response = await axios.post(`${apiUrl}`, body, {
      headers: {
        'fiware-service': fiware_service,
        'fiware-servicepath': fiware_servicepath,
      },
      params: {
        k, // Parámetro k
        i, // Parámetro i
      },
    });

    // Devolvemos la respuesta del agente
    return res.status(200).json({
      message: 'Datos enviados al agente correctamente',
      response: response.data,
    });
  } catch (error) {
    console.error('Error al enviar datos al agente:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};