import axios from "axios";
import yaml from "js-yaml";
import fetch from "node-fetch";
import Fiware from "../../../models/fiware.models.js";

const CONFIG_URL =
  "https://raw.githubusercontent.com/AlexHernandez2698632494/AURA/refs/heads/master/api_aura/src/modules/config/ngsi.api.service.yml";

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
      url_notify02,
      nameStates,
      isSensorActuador,
      commandName,
      commandNameToggle,
      commandNameAnalogo,
      commandNameDial,
      commandNameToggleText,
    } = req.body;

    const fiware_service = req.headers["fiware-service"];
    const fiware_servicepath = req.headers["fiware-servicepath"];

    // Validaciones de parámetros requeridos
    const requiredFields = {
      apikey,
      deviceId,
      transporte,
      timezone,
      deviceName,
      deviceType,
      locacion,
      description,
      url_notify,
      url_notify02,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (!value) {
        return res.status(400).json({ message: `Falta el campo '${key}'.` });
      }
    }

    // Validación de fields adicionales para el tipo actuador/sensor-actuador
    if (isSensorActuador === 1 || isSensorActuador === 2) {
      const requiredActuatorFields = {
        nameStates,
        commandName,
      };

      for (const [key, value] of Object.entries(requiredActuatorFields)) {
        if (!value || (Array.isArray(value) && value.length === 0)) {
          return res
            .status(400)
            .json({ message: `Falta el campo '${key}' o está vacío.` });
        }
      }

      if (!Array.isArray(nameStates) || !Array.isArray(commandName)) {
        return res.status(400).json({
          message: "'nameStates' y 'commandName' deben ser arreglos.",
        });
      }

      if (nameStates.length !== commandName.length) {
        return res.status(400).json({
          message:
            "'nameStates' y 'commandName' deben tener la misma cantidad de elementos.",
        });
      }
    }

    const url_json = config.url_json.replace("https://", "http://");
    const url_orion = config.url_orion.replace("https://", "http://");

    const servicesRes = await axios.get(`${url_json}iot/services`, {
      headers: {
        "Content-Type": "application/json",
        "fiware-service": fiware_service,
        "fiware-servicepath": fiware_servicepath,
      },
    });

    const serviceExists = servicesRes.data.services.some(
      (service) => service.apikey === apikey
    );

    const fiwareRecords = await Fiware.find();

    // Validar existencia de deviceId
    for (const record of fiwareRecords) {
      const { data } = await axios.get(`${url_json}iot/devices`, {
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

    // Crear servicio si no existe
    if (!serviceExists) {
      for (const record of fiwareRecords) {
        const { data } = await axios.get(`${url_json}iot/services`, {
          headers: {
            "Content-Type": "application/json",
            "fiware-service": record.fiware_service,
            "fiware-servicepath": record.fiware_servicepath,
          },
        });

        const existsInDb = data.services.some(
          (service) => service.apikey === apikey
        );

        if (existsInDb) {
          return res.status(400).json({
            message: "apikey ya registrada en la base de datos.",
          });
        }
      }

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

      await axios.post(`${url_json}iot/services`, serviceBody, {
        headers: {
          "Content-Type": "application/json",
          "fiware-service": fiware_service,
          "fiware-servicepath": fiware_servicepath,
        },
      });
    }

    // Crear dispositivo
    if (isSensorActuador === 0) {
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
        url_json,
        isSensorActuador
      );
    } else if (isSensorActuador === 1) {
      await createDeviceActuador(
        deviceId,
        apikey,
        transporte,
        locacion,
        timezone,
        deviceName,
        deviceType,
        fiware_service,
        fiware_servicepath,
        url_json,
        nameStates,
        commandName,
        commandNameToggle,
        commandNameAnalogo,
        commandNameDial,
        commandNameToggleText,
        isSensorActuador
      );
    } else if (isSensorActuador === 2) {
      await createDeviceSensorActuador(
        deviceId,
        apikey,
        transporte,
        locacion,
        timezone,
        deviceName,
        deviceType,
        fiware_service,
        fiware_servicepath,
        url_json,
        nameStates,
        commandName,
        commandNameToggle,
        commandNameAnalogo,
        commandNameDial,
        commandNameToggleText,
        isSensorActuador
      );
    }
    let result = { success: true, data: {} }; // Valor por defecto
    if (isSensorActuador !== 1) {
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
    } else if (isSensorActuador === 1) {
      const result = await sendDataActuador(
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
    }

    const entity_name = `urn:ngsi-ld:${deviceId.substring(
      0,
      5
    )}:${deviceId.substring(5, 10)}`;
    const entity_type = deviceId.substring(0, 5);

    await createSubscription({
      url_orion,
      fiware_service,
      fiware_servicepath,
      entity_name,
      entity_type,
      description,
      url_notify,
      attributes: [
        "id",
        "sensors",
        "location",
        "deviceName",
        "status",
        "command",
      ],
    });

    if (url_notify02) {
      try {
        await createSubscriptionQuantumleap({
          url_orion,
          fiware_service,
          fiware_servicepath,
          entity_name,
          entity_type,
          description,
          url_notify: url_notify02,
          attributes: ["id", "sensors", "location"],
        });
      } catch (error) {
        console.error(
          "Error al crear la segunda suscripción:",
          error.response?.data || error.message
        );
      }
    }

    return res.status(serviceExists ? 201 : 201).json({
      message: serviceExists
        ? "Dispositivo y suscripción creados exitosamente."
        : "Servicio, dispositivo y suscripción creados exitosamente.",
      agentResponse: result.data,
    });
  } catch (error) {
    console.error(
      "Error en la creación del servicio o dispositivo:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      message: "Error en el servidor",
      error: error.message,
    });
  }
};

// ============================
// FUNCIONES AUXILIARES
// ============================

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
  url_json,
  isSensorActuador
) {
  const entity_name = `urn:ngsi-ld:${deviceId.substring(
    0,
    5
  )}:${deviceId.substring(5, 10)}`;
  const entity_type = deviceId.substring(0, 5);

  const deviceBody = {
    devices: [
      {
        device_id: deviceId,
        entity_name,
        entity_type,
        timezone,
        protocol: "IoTA-JSON",
        transport: transporte,
        apikey,
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
          {
            name: "isSensorActuador",
            type: "String",
            value: isSensorActuador,
          },
        ],
      },
    ],
  };

  await axios.post(`${url_json}iot/devices`, deviceBody, {
    headers: {
      "Content-Type": "application/json",
      "fiware-service": fiware_service,
      "fiware-servicepath": fiware_servicepath,
    },
  });
}

// ============================
// FUNCIONES AUXILIARES
// ============================

async function createDeviceActuador(
  deviceId,
  apikey,
  transporte,
  locacion,
  timezone,
  deviceName,
  deviceType,
  fiware_service,
  fiware_servicepath,
  url_json,
  nameStates,
  commandName,
  commandNameToggle,
  commandNameAnalogo,
  commandNameDial,
  commandNameToggleText,
  isSensorActuador
) {
  const entity_name = `urn:ngsi-ld:${deviceId.substring(
    0,
    5
  )}:${deviceId.substring(5, 10)}`;
  const entity_type = deviceId.substring(0, 5);

  // Aseguramos que los campos commandName, commandNameToggle, commandNameAnalogo, etc., sean arrays
  const addTimeout = (commands) =>
    Array.isArray(commands)
      ? commands.map((cmd) => ({
          ...cmd,
          timeout: 15,
        }))
      : [];

  const toggleCommands = addTimeout(commandNameToggle);
  const analogoCommands = addTimeout(commandNameAnalogo);
  const dialCommands = addTimeout(commandNameDial);
  const toggleTextCommands = addTimeout(commandNameToggleText);

  // Aseguramos que los atributos estén construidos correctamente
  const attributes = [
    { object_id: "location", name: "location", type: "geo:json" },
    ...nameStates.map((name) => ({
      name,
      type: "text",
      object_id: name,
    })),
  ];

  const commands = commandName.map((name) => ({
    name,
    type: "command",
  }));

  const deviceBody = {
    devices: [
      {
        device_id: deviceId,
        entity_name,
        entity_type,
        timezone,
        protocol: "IoTA-JSON",
        transport: transporte,
        apikey,
        attributes,
        commands,
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
          {
            name: "commandTypes",
            type: "object",
            value: {
              toggle: toggleCommands,
              analogo: analogoCommands,
              dial: dialCommands,
              toggleText: toggleTextCommands,
            },
          },
          {
            name: "isSensorActuador",
            type: "String",
            value: isSensorActuador,
          },
        ],
      },
    ],
  };

  await axios.post(`${url_json}iot/devices`, deviceBody, {
    headers: {
      "Content-Type": "application/json",
      "fiware-service": fiware_service,
      "fiware-servicepath": fiware_servicepath,
    },
  });
}

async function createDeviceSensorActuador(
  deviceId,
  apikey,
  transporte,
  locacion,
  timezone,
  deviceName,
  deviceType,
  fiware_service,
  fiware_servicepath,
  url_json,
  nameStates,
  commandName,
  commandNameToggle,
  commandNameAnalogo,
  commandNameDial,
  commandNameToggleText,
  isSensorActuador
) {
  const entity_name = `urn:ngsi-ld:${deviceId.substring(
    0,
    5
  )}:${deviceId.substring(5, 10)}`;
  const entity_type = deviceId.substring(0, 5);

  // Aseguramos que los campos commandNameToggle, commandNameAnalogo, commandNameDial, commandNameToggleText sean arrays
  const toggleCommands = Array.isArray(commandNameToggle)
    ? commandNameToggle
    : [];
  const analogoCommands = Array.isArray(commandNameAnalogo)
    ? commandNameAnalogo
    : [];
  const dialCommands = Array.isArray(commandNameDial) ? commandNameDial : [];
  const toggleTextCommands = Array.isArray(commandNameToggleText)
    ? commandNameToggleText
    : [];

  // Aseguramos que los atributos estén construidos correctamente
  const attributes = [
    { object_id: "sensors", name: "sensors", type: "Object" },
    { object_id: "location", name: "location", type: "geo:json" },
    ...nameStates.map((name) => ({
      name,
      type: "text",
      object_id: name,
    })),
  ];

  const commands = commandName.map((name) => ({
    name,
    type: "command",
  }));

  const deviceBody = {
    devices: [
      {
        device_id: deviceId,
        entity_name,
        entity_type,
        timezone,
        protocol: "IoTA-JSON",
        transport: transporte,
        apikey,
        attributes,
        commands,
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
          {
            name: "commandTypes",
            type: "object",
            value: {
              toggle: toggleCommands,
              analogo: analogoCommands,
              dial: dialCommands,
              toggleText: toggleTextCommands,
            },
          },
          {
            name: "isSensorActuador",
            type: "String",
            value: isSensorActuador,
          },
        ],
      },
    ],
  };

  await axios.post(`${url_json}iot/devices`, deviceBody, {
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

  const url_mqtt = config.url_mqtt.replace("https://", "http://");
  const body = { sensors: {} };

  try {
    const response = await axios.post(`${url_mqtt}`, body, {
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

async function sendDataActuador(
  apikey,
  deviceId,
  fiware_service,
  fiware_servicepath
) {
  const k = apikey;
  const i = deviceId;

  const url_mqtt = config.url_mqtt.replace("https://", "http://");
  const body = {};

  try {
    const response = await axios.post(`${url_mqtt}`, body, {
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

async function createSubscription({
  url_orion,
  fiware_service,
  fiware_servicepath,
  entity_name,
  entity_type,
  description,
  url_notify,
  attributes,
}) {
  const body = {
    description,
    subject: {
      entities: [
        {
          idPattern: entity_name,
          type: entity_type,
        },
      ],
      condition: {
        attrs: attributes,
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
        "status",
        "command",
      ],
      attrsFormat: "keyValues",
    },
    metadata: ["dateCreated", "dateModified"],
  };

  await axios.post(`${url_orion}subscriptions`, body, {
    headers: {
      "Content-Type": "application/json",
      "fiware-service": fiware_service,
      "fiware-servicepath": fiware_servicepath,
    },
  });
}

async function createSubscriptionQuantumleap({
  url_orion,
  fiware_service,
  fiware_servicepath,
  entity_name,
  entity_type,
  description,
  url_notify,
  attributes,
}) {
  const body = {
    description,
    subject: {
      entities: [
        {
          idPattern: entity_name,
          type: entity_type,
        },
      ],
      condition: {
        attrs: attributes,
      },
    },
    notification: {
      http: {
        url: url_notify,
      },
      attrs: [
        "id",
        "sensors",
        "location",
        "TimeInstant",
        "servicePath",
        "deviceName",
      ],
    },
    metadata: ["dateCreated", "dateModified"],
  };

  await axios.post(`${url_orion}subscriptions`, body, {
    headers: {
      "Content-Type": "application/json",
      "fiware-service": fiware_service,
      "fiware-servicepath": fiware_servicepath,
    },
  });
}
