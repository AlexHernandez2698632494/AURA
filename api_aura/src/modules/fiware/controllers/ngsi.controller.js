import axios from "axios";
import yaml from "js-yaml";
import Alert from "../models/Alert.models.js";
import mongoose from "mongoose";
import { connectOrionDB } from "../../../config/db.js";
import Fiware from "../models/fiware.models.js";
import FiwareBuilding from "../models/fiwareBuilding.models.js";
import building from "../models/building.models.js";
import Rule from "../models/Rule.models.js";
import LocalRule from "../models/LocalRule.models.js";
import {
  url_orion,
  getSensorMapping,
  url_mqtt,
  url_json,
} from "../../../utils/Github.utils.js";
// Cambia https:// a http:// para la URL base de Orion
const ORION_BASE_URL = url_orion;
//const ORION_BASE_URL = "https://orion.sima.udb.edu.sv/v2/"

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
    const fiwareService = req.headers["fiware-service"];
    if (!fiwareService) {
      return res
        .status(400)
        .json({ error: "El header fiware-service es requerido" });
    }

    // Conectar a la base de datos de Orion usando el fiwareService (MongoDB nativo)
    const connection = await connectOrionDB(fiwareService);
    const db = connection.db();
    const entitiesCollection = db.collection("entities");

    // Obtenemos solo los campos necesarios: "_id.servicePath"
    const entitiesCursor = entitiesCollection.find(
      {},
      { projection: { "_id.servicePath": 1 } }
    );
    const entities = await entitiesCursor.toArray();

    // Extraemos todos los servicePath
    const servicePaths = entities.map((ent) => ent._id.servicePath);

    // Eliminamos duplicados usando Set
    const uniqueServicePaths = [...new Set(servicePaths)];

    // Devolvemos solo la lista de servicePath únicos
    res.status(200).json(uniqueServicePaths);
  } catch (error) {
    console.error("❌ Error al obtener los servicePath:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getSubServiceBuilding = async (req, res) => {
  try {
    const service = req.headers["fiware-service"];
    const servicePath = req.headers["fiware-servicepath"]; // Agregamos la variable para leer el servicepath

    if (!service) {
      return res
        .status(400)
        .json({ error: "El header fiware-service es requerido" });
    }

    const buildings = await FiwareBuilding.find({ fiware_service: service });

    if (!buildings || buildings.length === 0) {
      return res.status(404).json({
        error: `No se encontraron edificios para el servicio ${service}`,
      });
    }

    // Filtramos según el servicepath si se proporciona, o devolvemos todos si es "/"
    let filteredBuildings = buildings;

    if (servicePath && servicePath !== "/#") {
      // Reemplazamos los guiones bajos por espacios en los servicePaths antes de compararlos
      const formattedServicePath = servicePath
        .trim()
        .replace(/_/g, " ")
        .toLowerCase();

      filteredBuildings = buildings.filter((building) => {
        // Reemplazamos los guiones bajos por espacios en la base de datos para compararlo
        const formattedBuildingPath = building.fiware_servicepath
          .trim()
          .replace(/_/g, " ")
          .toLowerCase();
        return formattedBuildingPath === formattedServicePath;
      });
    }

    if (filteredBuildings.length === 0) {
      return res.status(404).json({
        error: `No se encontró el subservicio para el servicepath ${servicePath}`,
      });
    }

    // Obtenemos los datos de los subservicios
    const subservices = await Promise.all(
      filteredBuildings.map(async (fiwareBuilding) => {
        try {
          const buildingName = fiwareBuilding.fiware_servicepath.replace(
            /_/g,
            " "
          );
          const buildingData = await building.findOne({ nombre: buildingName });
          return {
            subservice: fiwareBuilding.fiware_servicepath,
            location: buildingData ? buildingData.localizacion : null,
            name: buildingData ? buildingData.nombre : null,
            nivel: buildingData ? buildingData.nivel : null,
          };
        } catch (err) {
          console.error(
            `Error al buscar el edificio ${fiwareBuilding.fiware_servicepath}:`,
            err
          );
          return {
            subservice: fiwareBuilding.fiware_servicepath,
            location: null,
          };
        }
      })
    );

    subservices.sort((a, b) => a.subservice.localeCompare(b.subservice));

    return res.json(subservices);
  } catch (error) {
    console.error("Error al obtener subservicios de edificios:", error);
    return res.status(500).json({
      error: "Hubo un problema al obtener los subservicios de edificios.",
    });
  }
};

export const getSubServiceBranch = async (req, res) => {
  try {
    const service = req.headers["fiware-service"];
    const serviceBuilding = req.headers["fiware-service-building"];

    if (!service || !serviceBuilding) {
      return res.status(400).json({
        error:
          "Los headers fiware-service y fiware-service-building son requeridos",
      });
    }

    const branches = await Fiware.find({
      fiware_service: service,
      fiware_service_building: serviceBuilding,
    });

    if (!branches || branches.length === 0) {
      return res.status(404).json({
        error: `No se encontraron servicepaths para el servicio ${service} y el edificio ${serviceBuilding}`,
      });
    }

    const subservices = branches.map((branch) => ({
      subservice: branch.fiware_servicepath,
    }));
    subservices.sort((a, b) => a.subservice.localeCompare(b.subservice));

    return res.json(subservices);
  } catch (error) {
    console.error("Error al obtener subservicios de sucursales:", error);
    return res.status(500).json({
      error: "Hubo un problema al obtener los subservicios de sucursales.",
    });
  }
};

export const getSubServiceBuildingAndBranch = async (req, res) => {
  try {
    const service = req.headers["fiware-service"];
    const servicePath = req.headers["fiware-servicepath"]; // Para filtrar por el servicepath

    if (!service) {
      return res
        .status(400)
        .json({ error: "El header fiware-service es requerido" });
    }

    const buildings = await FiwareBuilding.find({ fiware_service: service });

    if (!buildings || buildings.length === 0) {
      return res.status(404).json({
        error: `No se encontraron edificios para el servicio ${service}`,
      });
    }

    // Filtramos según el servicepath si se proporciona
    let filteredBuildings = buildings;

    if (servicePath && servicePath !== "/#") {
      const formattedServicePath = servicePath
        .trim()
        .replace(/_/g, " ")
        .toLowerCase();
      filteredBuildings = buildings.filter((building) => {
        const formattedBuildingPath = building.fiware_servicepath
          .trim()
          .replace(/_/g, " ")
          .toLowerCase();
        return formattedBuildingPath === formattedServicePath;
      });
    }

    if (filteredBuildings.length === 0) {
      return res.status(404).json({
        error: `No se encontró el subservicio para el servicepath ${servicePath}`,
      });
    }

    // Obtenemos los datos de los subservicios y los salones
    const subservices = await Promise.all(
      filteredBuildings.map(async (fiwareBuilding) => {
        try {
          const buildingName = fiwareBuilding.fiware_servicepath.replace(
            /_/g,
            " "
          );
          const buildingData = await building.findOne({ nombre: buildingName });

          // Obtener la ubicación y el nivel del edificio
          const buildingLocation = buildingData
            ? buildingData.localizacion
            : null;
          const buildingLevel = buildingData ? buildingData.nivel : null;

          // Buscamos los salones dentro del edificio
          const branches = await Fiware.find({
            fiware_service: service,
            fiware_service_building: fiwareBuilding.fiware_servicepath,
          });

          // Generamos los salones con su enlace
          const salonesConEnlace = branches.map((branch) => {
            const branchName = branch.fiware_servicepath.split("/").pop(); // El nombre del salón es la última parte del path
            const branchLink = `http://localhost:4201/premium/building/${buildingName}/level/${buildingLevel}/branch/${branchName}`;
            return {
              nombre: branchName,
              nivel: buildingLevel, // Usamos el mismo nivel del edificio
              subservice: branch.fiware_servicepath,
              enlace: branchLink,
            };
          });

          return {
            name: buildingName, // Nombre del edificio
            subservice: fiwareBuilding.fiware_servicepath, // Subservice del edificio
            nivel: buildingLevel, // Nivel del edificio
            location: buildingLocation, // Ubicación del edificio
            salones: salonesConEnlace, // Incluir los salones
          };
        } catch (err) {
          console.error(
            `Error al buscar el edificio ${fiwareBuilding.fiware_servicepath}:`,
            err
          );
          return {
            subservice: fiwareBuilding.fiware_servicepath,
            location: null,
          };
        }
      })
    );

    // Aplanamos el arreglo para devolver solo los edificios y salones con la información que solicitaste
    const result = subservices.map((building) => {
      const { name, subservice, nivel, location, salones } = building;
      return {
        name,
        subservice,
        nivel,
        location,
        salones,
      };
    });

    return res.json(result);
  } catch (error) {
    console.error(
      "Error al obtener subservicios de edificios y salones:",
      error
    );
    return res.status(500).json({
      error:
        "Hubo un problema al obtener los subservicios de edificios y salones.",
    });
  }
};

export const getEntitiesWithAlerts = async (req, res) => {
  try {
    // Verificar si los headers necesarios están presentes
    if (!req.headers["fiware-service"]) {
      return res.status(400).json({
        message: "Faltan los headers requeridos: Fiware-Service.",
      });
    } else if (!req.headers["fiware-servicepath"]) {
      return res.status(400).json({
        message: "Faltan los headers requeridos: Fiware-ServicePath.",
      });
    }

    const headers = {
      "Fiware-Service": req.headers["fiware-service"],
      "Fiware-ServicePath": req.headers["fiware-servicepath"],
    };

    const params = {
      type: req.query.type || undefined,
      limit: req.query.limit || 100,
    };

    const sensorMapping = await getSensorMapping();
    const entities = await getEntities(headers, params);
    const alerts = await getAlerts();
    const defaultSensorColor = "#fff"; // Blanco para sensores
    const defaultActuatorColor = "#808080"; // Gris para actuadores
    console.log("entidades", entities);

    const combinedData = entities.map((entity) => {
      const variables = entity.sensors?.value
        ? Object.entries(entity.sensors.value).map(([key, value]) => {
            const mappedData = sensorMapping[key] || { label: key, unit: "" };

            const relatedAlerts = alerts.filter(
              (alert) => alert.variable === mappedData.label
            );

            const minRange = relatedAlerts.reduce(
              (min, alert) => Math.min(min, alert.initialRange),
              Infinity
            );
            const maxRange = relatedAlerts.reduce(
              (max, alert) => Math.max(max, alert.finalRange),
              -Infinity
            );

            const alert = relatedAlerts.find(
              (alert) =>
                value >= alert.initialRange && value <= alert.finalRange
            );

            return {
              name: mappedData.label,
              value: `${value} ${mappedData.unit}`,
              alert: alert
                ? {
                    name: alert.displayName,
                    color: alert.color,
                    level: alert.level,
                  }
                : undefined,
              minRange,
              maxRange,
            };
          })
        : [];

      // Buscar la alerta más crítica
      const highestAlert = variables.reduce((max, variable) => {
        if (variable.alert && (!max || variable.alert.level > max.level)) {
          return variable.alert;
        }
        return max;
      }, null);

      let highestAlertName = "";
      let highestAlertVariable = "";
      if (highestAlert) {
        const highestAlertVariableData = variables.find(
          (variable) =>
            variable.alert && variable.alert.level === highestAlert.level
        );
        if (highestAlertVariableData) {
          highestAlertName = highestAlertVariableData.alert.name;
          highestAlertVariable = highestAlertVariableData.name;
        }
      }

      // Formatear el TimeInstant principal
      const formattedTimeInstant = entity.TimeInstant?.value
        ? formatTimeInstant(entity.TimeInstant.value)
        : null;

      // Detectar si es actuador (por presencia de comandos)
      const isActuator = !!entity.commandTypes?.value;
      const isSensor = variables.length > 0;

      // Determinar nivel
      const level = highestAlert ? highestAlert.level : 0;

      // Determinar color
      let color;
      if (highestAlert) {
        color = highestAlert.color;
      } else if (isActuator) {
        color = defaultActuatorColor; // gris
      } else if (isSensor) {
        color = defaultSensorColor; // blanco
      } else {
        color = defaultSensorColor; // valor por defecto si no se puede determinar
      }

      // Inicializar la estructura de salida
      const result = {
        id: entity.id,
        type: entity.type,
        location: entity.location,
        externalUri: entity.externalUri,
        color,
        level,
        highestAlertName,
        highestAlertVariable,
        variables,
        timeInstant: formattedTimeInstant,
        deviceName: entity.deviceName?.value,
        deviceType: entity.deviceType?.value,
        isSensorActuador: entity.isSensorActuador?.value,
        commandTypes: entity.commandTypes?.value,
        commands: [], // Lista que contendrá los comandos dinámicamente
      };

      // Agrupar los comandos en la estructura "commands"
      if (entity.commandTypes?.value) {
        const commandTypes = entity.commandTypes.value;

        for (const [type, commands] of Object.entries(commandTypes)) {
          for (const commandObj of commands) {
            const commandName = commandObj?.name;
            if (!commandName) continue; // Evitar errores con comandos sin nombre

            const command = {
              name: commandName, // Nombre del comando
              status: "", // Inicializa el status
              states: "", // Inicializa los states
              info: "", // Inicializa el campo de info
              statusTimeInstant: "", // Inicializa el timeInstant de status
              statesTimeInstant: "", // Inicializa el timeInstant de states
              infoTimeInstant: "", // Inicializa el timeInstant de info
              rules: null,
            };

            // Buscar las claves asociadas al comando
            const statusKey = `${commandName}_status`;
            const statesKey = `${commandName}_states`;
            const infoKey = `${commandName}_info`;
            const rulesKey = `$rules_{commandName}`;
            //console.log(statusKey);

            // Revisar si existen las claves y asignar sus valores
            if (entity[statusKey]?.value !== undefined) {
              command.status = entity[statusKey].value;
              if (entity[statusKey]?.metadata?.TimeInstant?.value) {
                command.statusTimeInstant = formatTimeInstant(
                  entity[statusKey].metadata.TimeInstant.value
                );
              }
            }

            if (entity[statesKey]?.value !== undefined) {
              command.states = entity[statesKey].value;
              if (entity[statesKey]?.metadata?.TimeInstant?.value) {
                command.statesTimeInstant = formatTimeInstant(
                  entity[statesKey].metadata.TimeInstant.value
                );
              }
            }

            if (entity[infoKey]?.value !== undefined) {
              command.info = entity[infoKey].value;
              if (entity[infoKey]?.metadata?.TimeInstant?.value) {
                command.infoTimeInstant = formatTimeInstant(
                  entity[infoKey].metadata.TimeInstant.value
                );
              }
            }

            if (entity[rulesKey] && entity[rulesKey].type === "object") {
              command.rules = {
                value: entity[rulesKey].value || {},
                timeInstant: entity[rulesKey]?.metadata?.TimeInstant?.value
                  ? formatTimeInstant(
                      entity[rulesKey].metadata.TimeInstant.value
                    )
                  : null,
              };
            }
            // Agregar el objeto de comando al arreglo de "commands"
            result.commands.push(command);
          }
        }
      }

      return result;
    });

    res.json(combinedData);
  } catch (error) {
    console.error("Error obteniendo datos combinados:", error);
    res.status(500).json({ message: "Error al obtener datos combinados." });
  }
};

// Función para formatear el TimeInstant
export function formatTimeInstant(timeInstant) {
  // Crear un objeto Date desde el valor del TimeInstant (es un string con formato ISO 8601)
  const date = new Date(timeInstant);

  // Restar 6 horas (para ajustarlo a la zona horaria GMT-6)
  date.setHours(date.getHours()); // Restar las 6 horas para ajustar a GMT-6
  console.log("Fecha ajustada:", date); // Para depuración
  // Formatear la fecha
  const day = String(date.getDate()).padStart(2, "0");
  const month = date.toLocaleString("es-ES", { month: "short" }); // Obtiene el mes en español (abreviado)
  const year = date.getFullYear();

  // Convertir la hora a formato de 12 horas
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  let ampm = hours >= 12 ? "P.M." : "A.M.";

  // Convertir a formato de 12 horas
  hours = hours % 12;
  hours = hours ? hours : 12; // La hora 0 debe ser 12 en formato de 12 horas

  // Formato: dd-mmm-yyyy hh:mm A.M./P.M.
  return `${day}-${month}-${year} ${hours}:${minutes} ${ampm}`;
}

export const sendDataToAgent = async (req, res) => {
  try {
    // Extrayendo los parámetros, headers y body de la solicitud
    const { k, i } = req.query; // Parámetros k e i
    const { fiware_service, fiware_servicepath } = req.headers; // Headers fiware-service y fiware-servicepath
    const body = req.body; // Body de la solicitud

    // Enviamos la solicitud al agente en el puerto 7896
    const response = await axios.post(`${url_mqtt}`, body, {
      headers: {
        "fiware-service": fiware_service,
        "fiware-servicepath": fiware_servicepath,
      },
      params: {
        k, // Parámetro k
        i, // Parámetro i
      },
    });

    // Devolvemos la respuesta del agente
    return res.status(200).json({
      message: "Datos enviados al agente correctamente",
      response: response.data,
    });
  } catch (error) {
    console.error("Error al enviar datos al agente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateActuatorStatusController = async (req, res) => {
  try {
    const headers = {
      "Fiware-Service": req.headers["fiware-service"] || "default",
      "Fiware-ServicePath": req.headers["fiware-servicepath"] || "/",
    };
    const params = {
      type: req.query.type || undefined,
      limit: req.query.limit || 100,
    };

    const { id, attributeName, value } = req.body;

    if (!id || !attributeName || typeof value === "undefined") {
      return res.status(400).json({
        message: "Faltan campos obligatorios en el cuerpo de la solicitud.",
      });
    }

    // Paso 1: Verificar si el actuador existe
    const entityUrl = `${url_orion}entities/${id}`;
    console.log("entidadID", entityUrl);
    try {
      const response = await axios.get(entityUrl, { headers, params });

      console.log(
        "Respuesta de Orion al consultar la entidad:",
        JSON.stringify(response.data, null, 2)
      );

      // Si quieres devolver la entidad encontrada en la respuesta también, podrías hacerlo aquí.
      // Pero sigamos con la actualización del estado.
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res
          .status(404)
          .json({ message: `El actuador con ID '${id}' no existe en Orion.` });
      } else {
        console.error("Error consultando la entidad en Orion:", error.message);
        throw error;
      }
    }
    const type = id.substring(12, 17);
    // Paso 2: Si existe, actualizar el estado
    const updateBody = {
      actionType: "update",
      entities: [
        {
          type,
          id,
          [attributeName]: {
            value,
            type: "command",
          },
        },
      ],
    };

    const updateUrl = `${url_json}v2/op/update`;
    console.log("agente", updateUrl);
    const updateResponse = await axios.post(updateUrl, updateBody, {
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
    });

    return res.status(200).json({
      message: "Estado del actuador actualizado correctamente.",
      response: updateResponse.data,
    });
  } catch (error) {
    console.error("Error al actualizar el actuador:", error);
    return res.status(500).json({
      message: "Error interno del servidor",
      error: error.response?.data || error.message,
    });
  }
};

/*  Reglas de condicion */
export const createRule = async (req, res) => {
  try {
    const {
      conditions,
      conditionLogic,
      actuatorEntityId,
      command,
      commandValue,
      enabled,
    } = req.body;
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    if (!conditions) {
      return res
        .status(400)
        .json({ message: "El campo 'conditions' es obligatorio." });
    }

    if (!Array.isArray(conditions)) {
      return res
        .status(400)
        .json({ message: "El campo 'conditions' debe ser un arreglo." });
    }

    if (conditions.length === 0) {
      return res
        .status(400)
        .json({ message: "El arreglo 'conditions' no puede estar vacío." });
    }
    // Validación para commandValue
    if (!commandValue) {
      return res
        .status(400)
        .json({ message: "El campo 'commandValue' es obligatorio." });
    }
    if (!Array.isArray(commandValue)) {
      return res
        .status(400)
        .json({ message: "El campo 'commandValue' debe ser un arreglo." });
    }

    if (!fiware_service) {
      return res
        .status(400)
        .json({ message: "El header 'fiware-service' es obligatorio." });
    }
    if (!fiware_servicepath) {
      return res
        .status(400)
        .json({ message: "El header 'fiware-servicepath' es obligatorio." });
    }
    const newRule = new Rule({
      conditions,
      conditionLogic: conditionLogic || "AND",
      actuatorEntityId,
      command,
      commandValue,
      enabled: enabled !== undefined ? enabled : true,
      service: fiware_service,
      subservice: fiware_servicepath,
    });

    await newRule.save();
    res.status(201).json(newRule);
  } catch (error) {
    console.error("Error creando la regla:", error);
    res
      .status(500)
      .json({ message: "Error al crear la regla.", error: error.message });
  }
};

export const getAllRules = async (req, res) => {
  try {
    const rules = await Rule.find({});
    res.json(rules);
  } catch (error) {
    console.error("Error obteniendo reglas:", error);
    res.status(500).json({ message: "Error al obtener reglas." });
  }
};

export const getRuleById = async (req, res) => {
  try {
    const rule = await Rule.findOne({ _id: req.params.id, enabled: true });
    if (!rule) {
      return res.status(404).json({ message: "Regla no encontrada." });
    }
    res.json(rule);
  } catch (error) {
    console.error("Error obteniendo regla:", error);
    res.status(500).json({ message: "Error al obtener regla." });
  }
};

// 🟢 Actualizar regla
export const updateRule = async (req, res) => {
  try {
    const updatedRule = await Rule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!updatedRule) {
      return res.status(404).json({ message: "Regla no encontrada." });
    }
    res.json(updatedRule);
  } catch (error) {
    console.error("Error actualizando regla:", error);
    res.status(500).json({ message: "Error al actualizar regla." });
  }
};

// 🟢 Eliminar regla
export const deleteRule = async (req, res) => {
  try {
    const deletedRule = await Rule.findByIdAndDelete(req.params.id);
    if (!deletedRule) {
      return res.status(404).json({ message: "Regla no encontrada." });
    }
    res.json({ message: "Regla eliminada correctamente." });
  } catch (error) {
    console.error("Error eliminando regla:", error);
    res.status(500).json({ message: "Error al eliminar regla." });
  }
};

export const getRulesByServiceSubserviceAndActuator = async (req, res) => {
  try {
    const actuatorId = req.params.actuatorId;
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    if (!actuatorId) {
      return res
        .status(400)
        .json({ message: "El parámetro 'actuatorId' es obligatorio." });
    }

    if (!fiware_service) {
      return res
        .status(400)
        .json({ message: "El header 'fiware-service' es obligatorio." });
    }

    if (!fiware_servicepath) {
      return res
        .status(400)
        .json({ message: "El header 'fiware-servicepath' es obligatorio." });
    }

    const rules = await Rule.find({
      actuatorEntityId: actuatorId,
      service: fiware_service,
      subservice: fiware_servicepath,
      enabled: true, // 👈 filtro por enabled
    });

    res.json(rules);
  } catch (error) {
    console.error(
      "Error al obtener reglas por servicio, subservicio y actuador:",
      error
    );
    res.status(500).json({ message: "Error al obtener reglas." });
  }
};

export const getRulesByServiceSubserviceActuatorAndCommand = async (
  req,
  res
) => {
  try {
    const { actuatorId, command } = req.params;
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    if (!actuatorId || !command) {
      return res.status(400).json({
        message: "Los parámetros 'actuatorId' y 'command' son obligatorios.",
      });
    }

    if (!fiware_service) {
      return res
        .status(400)
        .json({ message: "El header 'fiware-service' es obligatorio." });
    }

    if (!fiware_servicepath) {
      return res
        .status(400)
        .json({ message: "El header 'fiware-servicepath' es obligatorio." });
    }
    const rules = await Rule.find({
      actuatorEntityId: actuatorId,
      service: fiware_service,
      subservice: fiware_servicepath,
      enabled: true, // 👈 filtro por enabled
    });

    res.json(rules);
  } catch (error) {
    console.error("Error al obtener reglas filtradas:", error);
    res.status(500).json({ message: "Error al obtener reglas." });
  }
};

export const updateRuleEnabled = async (req, res) => {
  try {
    const { enabled } = req.body;

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        message: "El campo 'enabled' es obligatorio y debe ser booleano.",
      });
    }

    const updatedRule = await Rule.findByIdAndUpdate(
      req.params.id,
      { enabled },
      { new: true }
    );

    if (!updatedRule) {
      return res.status(404).json({ message: "Regla no encontrada." });
    }

    res.json(updatedRule);
  } catch (error) {
    console.error("Error actualizando 'enabled':", error);
    res.status(500).json({ message: "Error al actualizar 'enabled'." });
  }
};

export const getRuleStats = async (req, res) => {
  try {
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    // Filtro base (opcional por servicio/subservicio)
    const baseFilter = {};
    if (fiware_service) baseFilter.service = fiware_service;
    if (fiware_servicepath) baseFilter.subservice = fiware_servicepath;

    // Conteo total
    const total = await Rule.countDocuments(baseFilter);

    // enabled: true y estadoEliminacion: 0 (reglas activas no eliminadas)
    const enabledTrue = await Rule.countDocuments({
      ...baseFilter,
      enabled: true,
      estadoEliminacion: 0,
    });

    // enabled: false y estadoEliminacion: 1 (reglas desactivadas y eliminadas)
    const enabledFalse = await Rule.countDocuments({
      ...baseFilter,
      enabled: false,
      estadoEliminacion: 1,
    });

    // enabled = 1 (por si se guardaron como número)
    const enabled1 = await Rule.countDocuments({
      ...baseFilter,
      enabled: 1,
    });

    // Reglas con createdAt definido (todas deberían tenerlo si usas timestamps)
    const created = await Rule.countDocuments({
      ...baseFilter,
      createdAt: { $exists: true },
    });

    // Reglas modificadas (updatedAt > createdAt)
    const modified = await Rule.countDocuments({
      ...baseFilter,
      $expr: { $gt: ["$updatedAt", "$createdAt"] },
    });

    // Reglas eliminadas (estadoEliminacion = 1)
    const eliminadas = await Rule.countDocuments({
      ...baseFilter,
      estadoEliminacion: 1,
    });

    // Reglas no eliminadas (estadoEliminacion = 0)
    const noEliminadas = await Rule.countDocuments({
      ...baseFilter,
      estadoEliminacion: 0,
    });

    // Respuesta final
    res.json({
      total,
      enabledTrue,
      enabledFalse,
      enabled1,
      created,
      modified,
      eliminadas,
      noEliminadas,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas de reglas:", error);
    res.status(500).json({
      message: "Error al obtener estadísticas de reglas.",
      error: error.message,
    });
  }
};

export const FailedStatusGhost = async (req, res) => {
  try {
    // Extrayendo los parámetros, headers y body de la solicitud
    const { k, i } = req.query; // Parámetros k e i
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    const body = req.body; // Body de la solicitud

    // URL del agente (puerto 7896)
    // Validación de headers requeridos
    if (!fiware_service) {
      return res.status(400).json({
        message: "Header 'fiware-service' son requeridos",
      });
    } else if (!fiware_servicepath) {
      return res.status(400).json({
        message: "'fiware-servicepath' son requeridos",
      });
    } else if (!k) {
      return res.status(400).json({
        message: "El parámetro 'k' es requerido",
      });
    } else if (!i) {
      return res.status(400).json({
        message: "El parámetro 'i' es requerido",
      });
    }

    // Enviamos la solicitud al agente en el puerto 7896
    const response = await axios.post(`${url_mqtt}`, body, {
      headers: {
        "fiware-service": fiware_service,
        "fiware-servicepath": fiware_servicepath,
      },
      params: {
        k, // Parámetro k
        i, // Parámetro i
      },
    });

    // Devolvemos la respuesta del agente
    return res.status(202).json({
      message: "Comando fantasma actualizado correctamente",
      response: response.data,
    });
  } catch (error) {
    console.error("Error al enviar datos al agente:", error);
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateRuleType = async (req, res) => {
  try {
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];
    const { deviceId, value } = req.body;
    if (!fiware_service) {
      return res.status(400).json({
        message: "El header 'fiware-service' es obligatorio.",
      });
    } else if (!fiware_servicepath) {
      return res.status(400).json({
        message: "El header 'fiware-servicepath' es obligatorio.",
      });
    } else if (!deviceId) {
      return res.status(400).json({
        message: "El campo 'deviceId' es obligatorio.",
      });
    } else if (typeof value !== "string") {
      return res.status(400).json({
        message: "El campo 'value' debe ser una cadena de texto.",
      });
    } else if (!value) {
      return res.status(400).json({
        message: "El campo 'value' no puede estar vacío.",
      });
    }

    console.log("deviceId", deviceId);
    const parts = deviceId.split(":");
    if (parts.length < 4) {
      return res.status(400).json({ message: "deviceId inválido" });
    }
    const shortDeviceId = parts.slice(-2).join("");
    console.log("shortDeviceId", shortDeviceId);

    const orionResponse = await axios.post(
      `${url_orion}entities/${deviceId}/attrs`,
      {
        ruleType: {
          value: value,
          type: "String",
        },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Fiware-Service": fiware_service,
          "Fiware-ServicePath": fiware_servicepath,
        },
      }
    );
    const deviceResponse = await axios.get(
      `${url_json}iot/devices/${shortDeviceId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Fiware-Service": fiware_service,
          "Fiware-ServicePath": fiware_servicepath,
        },
      }
    );

    const device = deviceResponse.data;

    // 3. Copiar los static_attributes y actualizar/agregar ruleType
    let staticAttrs = device.static_attributes || [];

    const existingIndex = staticAttrs.findIndex(
      (attr) => attr.name === "ruleType"
    );
    if (existingIndex !== -1) {
      staticAttrs[existingIndex].value = value;
    } else {
      staticAttrs.push({
        name: "ruleType",
        type: "String",
        value: value,
      });
    }
    // Actualizacion de tipo de regla en Iot Agent
    const iotAgentResponse = await axios.put(
      `${url_json}iot/devices/${shortDeviceId}`,
      { static_attributes: staticAttrs },
      {
        headers: {
          "Content-Type": "application/json",
          "Fiware-Service": fiware_service,
          "Fiware-ServicePath": fiware_servicepath,
        },
      }
    );

    res.status(200).json({
      message: "Tipo de regla actualizado correctamente.",
      orionStatus: orionResponse.status,
      // iotAgentStatus: iotAgentResponse.status,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el tipo de regla.",
      error: error.message,
    });
  }
};

export const updateRuleCommand = async (req, res) => {
  try {
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];
    const {
      deviceId,
      deviceName,
      description,
      apikey,
      attributeSensor,
      serviceSensor,
      subserviceSensor,
      operatorCondition,
      attributeCondition,
      operatorConditions,
      value,
      deviceActuadorId,
      deviceActuadorName,
      deviceActuadorApikey,
      command,
      payload,
      serviceActuador,
      subserviceActuador,
    } = req.body;

    const requiredFields = [
      "description",
      "deviceId",
      "deviceName",
      "apikey",
      "attributeSensor",
      "serviceSensor",
      "subserviceSensor",
      "operatorCondition",
      "attributeCondition",
      "operatorConditions",
      "value",
      "deviceActuadorId",
      "deviceActuadorName",
      "deviceActuadorApikey",
      "command",
      "payload",
      "serviceActuador",
      "subserviceActuador",
    ];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        return res.status(400).json({
          message: `Falta el campo'${field}', el nombre de ese campo es requerido.`,
        });
      }
    }
    if (!fiware_service) {
      return res.status(400).json({
        message: "El header 'fiware-service' es obligatorio.",
      });
    } else if (!fiware_servicepath) {
      return res.status(400).json({
        message: "El header 'fiware-servicepath' es obligatorio.",
      });
    }
    const parts = deviceId.split(":");
    if (parts.length < 4) {
      return res.status(400).json({ message: "deviceId inválido" });
    }
    const shortDeviceId = parts.slice(-2).join("");

    const sensorTopic = `/json/${apikey}/${shortDeviceId}/attrs/sensors`;
    const rulesAttributeName = `rules_${command}`;

    const ruleData = {
      description,
      source: [
        {
          deviceId,
          deviceName,
          apikey,
          attribute: Array.isArray(attributeSensor)
            ? attributeSensor[0]
            : attributeSensor,
          service: serviceSensor,
          subservice: subserviceSensor,
          topic: sensorTopic,
        },
      ],
      condition: {
        operator: operatorCondition,
        conditions: attributeCondition.map((attr, idx) => ({
          attribute: attr,
          operator: operatorConditions[idx],
          value: Array.isArray(value) ? value[idx] : value,
        })),
      },
      target: {
        deviceActuadorId,
        deviceActuadorName,
        deviceActuadorApikey,
        command,
        payload,
        service: serviceActuador,
        subservice: subserviceActuador,
      },
    };

    const updatePayload = {
      [rulesAttributeName]: {
        value: ruleData,
        type: "object",
      },
    };

    // Verificar que la entidad existe antes de actualizar
    try {
      await axios.get(`${url_orion}entities/${deviceActuadorId}`, {
        headers: {
          "Fiware-Service": fiware_service,
          "Fiware-ServicePath": fiware_servicepath,
        },
      });
    } catch (err) {
      return res.status(404).json({
        message:
          "El deviceActuadorId no existe en Orion con el service/servicePath proporcionados.",
        error: err.response?.data || err.message,
      });
    }

    // Actualizar el atributo en Orion
    const response = await axios.post(
      `${url_orion}entities/${deviceActuadorId}/attrs`,
      updatePayload,
      {
        headers: {
          "Content-Type": "application/json",
          "Fiware-Service": fiware_service,
          "Fiware-ServicePath": fiware_servicepath,
        },
      }
    );

    // Guardar la regla en el modelo LocalRule (MongoDB)
    try {
      const localRule = new LocalRule(ruleData);
      await localRule.save();
    } catch (err) {
      // Si falla la base de datos, igual responde éxito pero avisa en consola
      console.error("Error guardando la regla en LocalRule:", err.message);
    }

    res.status(201).json({
      message: "Comando de la regla actualizado correctamente.",
      data: response.data,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el comando de la regla.",
      error: error.message,
      details: error.response?.data,
    });
  }
};