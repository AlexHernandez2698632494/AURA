import axios from "axios";
import yaml from "js-yaml";
import fetch from "node-fetch";
import Fiware from "../../../models/fiware.models.js";

const CONFIG_URL =
  "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

async function getConfig() {
  const response = await fetch(CONFIG_URL);
  const text = await response.text();
  const config = yaml.load(text);
  return config.sensors;
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
      description,
      url_notify,
      url_notify02, // <-- nuevo campo
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
      return res
        .status(400)
        .json({ message: "Faltan el tipo de dispositivo." });
    else if (!locacion)
      return res.status(400).json({ message: "Faltan la locacion." });
    else if (!description) {
      return res.status(400).json({
        message: "Faltan 'description'",
      });
    } else if (!url_notify) {
      return res.status(400).json({
        message: "Faltan 'url_notify' ",
      });
    }else if (!url_notify02) {
      return res.status(400).json({
        message: "Faltan 'url_notify02' ",
      });
    }

    const url_json = config.url_json;
    const url_orion = config.url_orion.replace("https://", "http://");
    const apiUrl = url_json.replace("https://", "http://");

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

    if (serviceExists) {
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
            return res.status(409).json({
              message: `El deviceId '${deviceId}' ya existe en el sistema.`,
            });
          }
        } catch (error) {
          console.error(
            "Error al verificar si el deviceId ya existe:",
            error.response ? error.response.data : error.message
          );
          return res.status(500).json({
            message: "Error al verificar la existencia del deviceId.",
          });
        }
      }

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

      const result = await sendData(
        apikey,
        deviceId,
        fiware_service,
        fiware_servicepath
      );

      if (!result.success) {
        return res
          .status(500)
          .json({ message: "Error al enviar datos al agente." });
      }

      const entity_name = `urn:ngsi-ld:${deviceId.substring(
        0,
        5
      )}:${deviceId.substring(6, 10)}`;
      const entity_type = deviceId.substring(0, 5);

      const subscriptionBody = {
        description,
        subject: {
          entities: [
            {
              idPattern: entity_name,
              type: entity_type,
            },
          ],
          condition: {
            attrs: [
              "id",
              "sensors",
              "location",
              "deviceName",
              "status",
              "command",
            ],
          },
        },
        notification: {
          http: {
            url: url_notify,
            timeout: 5000,
          },
          attrs: [
            "id",
            "sensors",
            "location",
            "TimeInstant",
            "servicePath",
            "deviceName",
          ],
          attrsFormat: "keyValues",
        },
        metadata: ["dateCreated", "dateModified"],
      };

      try {
        await axios.post(`${url_orion}subscriptions`, subscriptionBody, {
          headers: {
            "Content-Type": "application/json",
            "fiware-service": fiware_service,
            "fiware-servicepath": fiware_servicepath,
          },
        });

        // Segunda suscripción (url_notify02)
        if (url_notify02) {
          const secondSubscriptionBody = {
            description: "Notificar sensor rakSensor",
            subject: {
              entities: [
                {
                  idPattern: entity_name,
                  type: entity_type,
                },
              ],
              condition: {
                attrs: ["id", "sensors", "location"],
              },
            },
            notification: {
              http: {
                url: url_notify02, // URL para la segunda suscripción
                timeout: 5000,
              },
              attrs: [
                "id",
                "sensors",
                "location",
                "TimeInstant",
                "servicePath",
                "deviceName",
              ],
              attrsFormat: "keyValues",
            },
            metadata: ["dateCreated", "dateModified"],
          };

          try {
            await axios.post(
              `${url_orion}subscriptions`,
              secondSubscriptionBody,
              {
                headers: {
                  "Content-Type": "application/json",
                  "fiware-service": fiware_service,
                  "fiware-servicepath": fiware_servicepath,
                },
              }
            );
          } catch (error) {
            console.error(
              "Error al crear la segunda suscripción:",
              error.response?.data || error.message
            );
            // No se detiene el flujo, pero se informa
          }
        }
      } catch (error) {
        return res.status(500).json({
          message: "Dispositivo creado, pero falló la suscripción.",
          agentResponse: result.data,
          error: error.response?.data || error.message,
        });
      }

      return res.status(201).json({
        message: "Dispositivo y suscripción creados exitosamente.",
        agentResponse: result.data,
      });
    } else {
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

      const entity_name = `urn:ngsi-ld:${deviceId.substring(
        0,
        5
      )}:${deviceId.substring(6, 10)}`;
      const entity_type = deviceId.substring(0, 5);

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

      const result = await sendData(
        apikey,
        deviceId,
        fiware_service,
        fiware_servicepath
      );

      if (!result.success) {
        return res
          .status(500)
          .json({ message: "Error al enviar datos al agente." });
      }

      const subscriptionBody = {
        description,
        subject: {
          entities: [
            {
              idPattern: entity_name,
              type: entity_type,
            },
          ],
          condition: {
            attrs: [
              "id",
              "sensors",
              "location",
              "deviceName",
              "status",
              "command",
            ],
          },
        },
        notification: {
          http: {
            url: url_notify,
            timeout: 5000,
          },
          attrs: [
            "id",
            "sensors",
            "location",
            "TimeInstant",
            "servicePath",
            "deviceName",
          ],
          attrsFormat: "keyValues",
        },
        metadata: ["dateCreated", "dateModified"],
      };

      try {
        await axios.post(`${url_orion}subscriptions`, subscriptionBody, {
          headers: {
            "Content-Type": "application/json",
            "fiware-service": fiware_service,
            "fiware-servicepath": fiware_servicepath,
          },
        });

        // Segunda suscripción (url_notify02)
        if (url_notify02) {
          const secondSubscriptionBody = {
            description: "Notificar sensor rakSensor",
            subject: {
              entities: [
                {
                  idPattern: entity_name,
                  type: entity_type,
                },
              ],
              condition: {
                attrs: ["id", "sensors", "location"],
              },
            },
            notification: {
              http: {
                url: url_notify02, // URL para la segunda suscripción
                timeout: 5000,
              },
              attrs: [
                "id",
                "sensors",
                "location",
                "TimeInstant",
                "servicePath",
                "deviceName",
              ],
              attrsFormat: "keyValues",
            },
            metadata: ["dateCreated", "dateModified"],
          };

          try {
            await axios.post(
              `${url_orion}subscriptions`,
              secondSubscriptionBody,
              {
                headers: {
                  "Content-Type": "application/json",
                  "fiware-service": fiware_service,
                  "fiware-servicepath": fiware_servicepath,
                },
              }
            );
          } catch (error) {
            console.error(
              "Error al crear la segunda suscripción:",
              error.response?.data || error.message
            );
            // No se detiene el flujo, pero se informa
          }
        }
      } catch (error) {
        return res.status(500).json({
          message: "Dispositivo creado, pero falló la suscripción.",
          agentResponse: result.data,
          error: error.response?.data || error.message,
        });
      }

      return res.status(201).json({
        message: "Servicio, dispositivo y suscripción creados exitosamente.",
        agentResponse: result.data,
      });
    }
  } catch (error) {
    console.error(
      "Error en la creación del servicio o dispositivo:",
      error.response ? error.response.data : error.message
    );
    return res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

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
        device_id: deviceId,
        entity_name: entity_name,
        entity_type: entity_type,
        timezone: timezone,
        protocol: "IoTA-JSON",
        transport: transporte,
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
              coordinates: locacion,
            },
          },
          {
            name: "deviceName",
            type: "String",
            value: deviceName,
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

async function sendData(apikey, deviceId, fiware_service, fiware_servicepath) {
  const k = apikey;
  const i = deviceId;

  const url_json = config.url_mqtt;
  const apiUrl = url_json.replace("https://", "http://");
  const body = {
    sensors: {},
  };

  try {
    const response = await axios.post(`${apiUrl}`, body, {
      headers: {
        "fiware-service": fiware_service,
        "fiware-servicepath": fiware_servicepath,
      },
      params: { k, i },
    });

    return { success: true, data: response.data };
  } catch (error) {
    console.error("Error al enviar datos al agente:", error);
    return { success: false, error: error.message };
  }
}
