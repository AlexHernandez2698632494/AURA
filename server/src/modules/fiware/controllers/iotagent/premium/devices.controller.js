import axios from "axios";
import yaml from "js-yaml";
import fetch from "node-fetch";
import Fiware from "../../../models/fiware.models.js";

const CONFIG_URL =
  "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

// Función para obtener la URL del servicio de la configuración
async function getConfig() {
  const response = await fetch(CONFIG_URL);
  const text = await response.text();
  const config = yaml.load(text);
  return config.sensors; // Devuelve la configuración de los sensores, que incluye la URL de Orion
}
const config = await getConfig();

export const createServiceDeviceJSON = async (req, res) => {
  try {
    const {
      apikey,
      deviceId,
      transporte,
      locacion,
      timezone,
      deviceName,
      deviceType,
    } = req.body;
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    // Validaciones de parámetros
    if (!apikey) return res.status(400).json({ message: "Faltan el apikey." });
    else if (!deviceId)
      return res.status(400).json({ message: "Faltan el deviceId." });
    else if (!transporte)
      return res.status(400).json({ message: "Faltan el transporte." });
    else if (!timezone)
      return res.status(400).json({ message: "Faltan la zona horaria." });
    else if (!deviceName)
      return res.status(400).json({ message: "Faltan el deviceName." });
    else if (!deviceType)
      return res.status(400).json({ message: "Faltan el tipo de dispositivo." });
    else if (!locacion)
      return res.status(400).json({ message: "Faltan la locacion." });

    const url_json = config.url_json;
    const apiUrl = url_json.replace("https://", "http://");

    // Validación 1: Verificar si la API key ya existe en los servicios
    const { data } = await axios.get(`${apiUrl}services`, {
      headers: {
        "Content-Type": "application/json",
        "fiware-service": fiware_service,
        "fiware-servicepath": fiware_servicepath,
      },
    });

    const serviceExists = data.services.some(
      (service) => service.apikey === apikey
    );

    // Si el servicio existe, proceder con la creación del dispositivo
    if (serviceExists) {
      // **Validación: Verificar si el deviceId ya existe en el sistema**
      const fiwareDeviceRecords = await Fiware.find();
      for (const record of fiwareDeviceRecords) {
        try {
          const { data } = await axios.get(`${apiUrl}devices`, {
            headers: {
              "Content-Type": "application/json",
              "fiware-service": record.fiware_service,
              "fiware-servicepath": record.fiware_servicepath,
            },
          });

          const deviceExists = data.devices.some(
            (device) => device.device_id === deviceId
          );
          if (deviceExists) {
            // Si el deviceId ya existe, retornar error con el mensaje adecuado
            return res.status(409).json({
              message: `El deviceId '${deviceId}' ya existe en el sistema.`,
            });
          }
        } catch (error) {
          // Si ocurre un error al obtener los dispositivos, loguear el error
          console.error(
            "Error al verificar si el deviceId ya existe:",
            error.response ? error.response.data : error.message
          );
          return res.status(500).json({
            message: "Error al verificar la existencia del deviceId.",
          });
        }
      }

      // Crear el dispositivo si no existe
      await createDevice(
        deviceId,
        apikey,
        transporte,
        locacion,
        timezone,
        deviceName,
        deviceType,
        fiware_service,
        fiware_servicepath,
        apiUrl
      );

      // Enviar los datos después de crear el dispositivo
      await sendData(apikey, deviceId, fiware_service, fiware_servicepath, res);

      return res
        .status(201)
        .json({ message: "Dispositivo creado exitosamente." });
    } else {
      // Si el servicio no existe, se procederá con las validaciones y creación del servicio
      const fiwareRecords = await Fiware.find();
      for (const record of fiwareRecords) {
        const { data } = await axios.get(`${apiUrl}services`, {
          headers: {
            "Content-Type": "application/json",
            "fiware-service": record.fiware_service,
            "fiware-servicepath": record.fiware_servicepath,
          },
        });
        const existsInDbService = data.services.some(
          (service) => service.apikey === apikey
        );
        if (existsInDbService) {
          return res.status(400).json({
            message:
              "No se puede crear el servicio, apikey ya registrada en la base de datos.",
          });
        }
      }

      // **Validación: Verificar si el deviceId ya existe en los dispositivos**
      const fiwareRecords2 = await Fiware.find();
      for (const record of fiwareRecords2) {
        const { data } = await axios.get(`${apiUrl}devices`, {
          headers: {
            "Content-Type": "application/json",
            "fiware-service": record.fiware_service,
            "fiware-servicepath": record.fiware_servicepath,
          },
        });

        const deviceExists = data.devices.some(
          (device) => device.device_id === deviceId
        );
        if (deviceExists) {
          return res.status(409).json({
            message: `El deviceId '${deviceId}' ya existe en el sistema.`,
          });
        }
      }

      // Cálculo de entity_name y entity_type a partir del deviceId
      const entity_name = `urn:ngsi-ld:${deviceId.substring(
        0,
        4
      )}:${deviceId.substring(4, 9)}`;
      const entity_type = deviceId.substring(0, 4);

      // Crear el servicio si no existe
      const serviceBody = {
        services: [
          {
            apikey,
            cbroker: "http://orion:1026",
            entity_type: entity_type,
            resource: "/iot/json",
          },
        ],
      };

      await axios.post(`${apiUrl}services`, serviceBody, {
        headers: {
          "Content-Type": "application/json",
          "fiware-service": fiware_service,
          "fiware-servicepath": fiware_servicepath,
        },
      });

      // Ahora que el servicio ha sido creado, creamos el dispositivo
      await createDevice(
        deviceId,
        apikey,
        transporte,
        locacion,
        timezone,
        deviceName,
        deviceType,
        fiware_service,
        fiware_servicepath,
        apiUrl
      );

      // Enviar los datos después de crear el dispositivo
      await sendData(apikey, deviceId, fiware_service, fiware_servicepath, res);
    }
  } catch (error) {
    console.error(
      "Error en la creación del servicio o dispositivo:",
      error.response ? error.response.data : error.message
    );
    return res
      .status(500)
      .json({ message: "Error en el servidor", error: error.message });
  }
};

// Función que maneja la creación del dispositivo
async function createDevice(
  deviceId,
  apikey,
  transporte,
  locacion,
  timezone,
  deviceName,
  deviceType,
  fiware_service,
  fiware_servicepath,
  apiUrl
) {
  const entity_name = `urn:ngsi-ld:${deviceId.substring(
    0,
    5
  )}:${deviceId.substring(6, 10)}`;
  const entity_type = deviceId.substring(0, 5);

  const deviceBody = {
    devices: [
      {
        device_id: deviceId, // Aseguramos que deviceId se pase correctamente
        entity_name: entity_name, // Ahora se usa después de ser inicializado
        entity_type: entity_type, // Ahora se usa después de ser inicializado
        timezone: timezone,
        protocol: "IoTA-JSON",
        transport: transporte, // Incluir transporte
        apikey: apikey,
        attributes: [
          { object_id: "sensors", name: "sensors", type: "Object" },
          { object_id: "location", name: "location", type: "geo:json" },
        ],
        static_attributes: [
          {
            name: "location",
            type: "geo:json",
            value: {
              type: "Point",
              coordinates: locacion, // Usar las coordenadas pasadas dinámicamente
            },
          },
          {
            name: "deviceName",
            type: "String",
            value: deviceName, // Puedes reemplazar este valor si es dinámico
          },
          {
            name: "deviceType",
            type: "String",
            value: deviceType,
          },
        ],
      },
    ],
  };

  await axios.post(`${apiUrl}devices`, deviceBody, {
    headers: {
      "Content-Type": "application/json",
      "fiware-service": fiware_service,
      "fiware-servicepath": fiware_servicepath,
    },
  });
}

// Función sendData (agregada al final del flujo)
async function sendData(
  apikey,
  deviceId,
  fiware_service,
  fiware_servicepath,
  res
) {
  const k = apikey;
  const i = deviceId;

  // URL del agente (puerto 7896)
  const url_json = config.url_mqtt;
  const apiUrl = url_json.replace("https://", "http://"); // Aseguramos que use http
  // Cuerpo de la solicitud para enviar los datos al agente
  const body = {
    sensors: {}, // Un objeto vacío como mencionas
  };
  try {
    // Enviamos la solicitud al agente en el puerto 7896
    const response = await axios.post(`${apiUrl}`, body, {
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
}
