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
  return config.sensors.url_json;
}

export const createServiceDeviceJSON = async (req, res) => {
  try {
    const {
      apikey,
      deviceId,
      transporte,
      locacion,
      timezone,
      deviceName,
    } = req.body;
    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    // Validaciones de parámetros
    if (!apikey)
      return res.status(400).json({ message: "Faltan el apikey." });
    else if (!deviceId)
      return res.status(400).json({ message: "Faltan el deviceId." });
    else if (!transporte)
      return res.status(400).json({ message: "Faltan el transporte." });
    else if (!timezone)
      return res.status(400).json({ message: "Faltan la zona horaria." });
    else if (!deviceName)
      return res.status(400).json({ message: "Faltan el deviceName." });
    else if (!locacion)
      return res.status(400).json({ message: "Faltan la locacion." });

    const url_json = await getConfig();
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
              'Content-Type': 'application/json',
              'fiware-service': record.fiware_service,
              'fiware-servicepath': record.fiware_servicepath
            }
          });

          const deviceExists = data.devices.some(device => device.device_id === deviceId);
          if (deviceExists) {
            // Si el deviceId ya existe, retornar error con el mensaje adecuado
            return res.status(409).json({ message: `El deviceId '${deviceId}' ya existe en el sistema.` });
          }
        } catch (error) {
          // Si ocurre un error al obtener los dispositivos, loguear el error
          console.error("Error al verificar si el deviceId ya existe:", error.response ? error.response.data : error.message);
          return res.status(500).json({ message: "Error al verificar la existencia del deviceId." });
        }
      }

      // Crear el dispositivo si no existe
      await createDevice(deviceId, apikey, transporte, locacion, timezone, deviceName, fiware_service, fiware_servicepath, apiUrl);
      return res.status(201).json({ message: "Dispositivo creado exitosamente." });
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
          return res
            .status(400)
            .json({
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

        const deviceExists = data.devices.some(device => device.device_id === deviceId);
        if (deviceExists) {
          return res.status(409).json({ message: `El deviceId '${deviceId}' ya existe en el sistema.` });
        }
      }

      // Cálculo de entity_name y entity_type a partir del deviceId
      const entity_name = `urn:ngsi-ld:${deviceId.substring(0, 4)}:${deviceId.substring(4, 9)}`;
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
      await createDevice(deviceId, apikey, transporte, locacion, timezone, deviceName, fiware_service, fiware_servicepath, apiUrl);
    }

  } catch (error) {
    console.error("Error en la creación del servicio o dispositivo:", error.response ? error.response.data : error.message);
    return res.status(500).json({ message: "Error en el servidor", error: error.message });
  }
};

// Función que maneja la creación del dispositivo
async function createDevice(deviceId, apikey, transporte, locacion, timezone, deviceName, fiware_service, fiware_servicepath, apiUrl) {
  const entity_name = `urn:ngsi-ld:${deviceId.substring(0, 4)}:${deviceId.substring(4, 9)}`;
  const entity_type = deviceId.substring(0, 4);

  const deviceBody = {
    devices: [
      {
        device_id: deviceId, // Aseguramos que deviceId se pase correctamente
        entity_name: entity_name,  // Ahora se usa después de ser inicializado
        entity_type: entity_type,  // Ahora se usa después de ser inicializado
        timezone: timezone,
        protocol: "IoTA-JSON",
        transport: transporte, // Incluir transporte
        apikey: apikey,
        address: {
          type: "StructuredValue",
          value: {
            addressCountry: "SV",  // Puedes ajustar la dirección según tus necesidades
            addressLocality: "San Salvador",
            streetAddress: "Apopa Rio Tomayate",
          },
        },
        location: {
          type: "geo:json",
          value: {
            type: "Point",
            coordinates: locacion, // Usar las coordenadas pasadas dinámicamente
          },
        },
        attributes: [
          { object_id: "0ru", name: "sensors", type: "Object" },
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
