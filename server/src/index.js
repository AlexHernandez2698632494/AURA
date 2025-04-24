import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import morgan from "morgan";
import yaml from "js-yaml";
import fetch from "node-fetch";
import Alert from "./modules/fiware/models/Alert.models.js";

// Importar rutas y módulos
import statusRoutes from "./modules/auth/routes/checkConnection.routes.js";
import authModule from "./modules/auth/auth.module.js";
import orionRoutes from "./modules/fiware/routes/orion/index.routes.js";
import fiwareModule from "./modules/fiware/fiware.module.js";

// App y servidor
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middlewares
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(express.json());
app.use(bodyParser.json());

// Configuración
const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

// Obtener mappings
const getSensorMapping = async () => {
  try {
    const response = await fetch(MAPPING_YML_URL);
    const text = await response.text();
    const ymlData = yaml.load(text);
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

// Acumulador de notificaciones: solo último mensaje por dispositivo
const orionMessagesMap = {};

// Ruta para recibir notificaciones de Orion
app.post("/v1/notify/", async (req, res) => {
  const entity = req.body.data?.[0];
  if (!entity || !entity.id) {
    return res.status(400).json({ error: "Entidad inválida" });
  }

  const data = {
    timestamp: new Date().toISOString(),
    body: req.body,
  };

  orionMessagesMap[entity.id] = data;

  try {
    const sensorMapping = await getSensorMapping();
    const alerts = await Alert.find({ estadoEliminacion: 0 });

    const sensorsRaw = entity.sensors || {};
    let hasAlert = false;
    let nivel = 0;
    let color = '';

    const variables = Object.entries(sensorsRaw).map(([key, value]) => {
      const mapped = sensorMapping[key] || { label: key, unit: "" };

      const relatedAlerts = alerts.filter(a => a.variable === mapped.label);
      const minRange = relatedAlerts.reduce((min, a) => Math.min(min, a.initialRange), Infinity);
      const maxRange = relatedAlerts.reduce((max, a) => Math.max(max, a.finalRange), -Infinity);

      const matchingAlert = relatedAlerts.find(a =>
        value >= a.initialRange && value <= a.finalRange
      );

      if (matchingAlert) {
        hasAlert = true;
        if (matchingAlert.level > nivel) {
          nivel = matchingAlert.level;
          color = matchingAlert.color;
        }
      }

      return {
        name: mapped.label,
        value: `${value} ${mapped.unit}`,
        minRange,
        maxRange,
        alert: matchingAlert ? {
          name: matchingAlert.displayName,
          color: matchingAlert.color,
          level: matchingAlert.level
        } : undefined
      };
    });

    // Enriquecemos la entidad con el nivel y color
    if (hasAlert) {
      const enrichedEntity = {
        id: entity.id,
        type: entity.type,
        timestamp: data.timestamp,
        variables,
        raw: entity,
        nivel,
        color
      };
      io.emit("orion-alert", enrichedEntity); // Emitimos si hay alerta
    }

    res.status(200).json({});
  } catch (e) {
    console.error("Error evaluando alertas:", e);
    res.status(500).json({ error: "Error interno" });
  }
});

 // Ruta para consultar historial de notificaciones (mapeadas)
 app.get("/v1/messages", async (req, res) => {
  try {
    const sensorMapping = await getSensorMapping();
    const alerts = await Alert.find({ estadoEliminacion: 0 });
    const messagesArray = Object.values(orionMessagesMap);

    const mappedMessages = messagesArray.map(({ timestamp, body }) => {
      const entity = body.data?.[0] || {};
      const sensorsRaw = entity.sensors || {};

      let nivel = 0;
      let color = '';

      const variables = Object.entries(sensorsRaw).map(([key, value]) => {
        const mappedData = sensorMapping[key] || { label: key, unit: '' };
        const relatedAlerts = alerts.filter(alert => alert.variable === mappedData.label);

        const minRange = relatedAlerts.reduce((min, alert) => Math.min(min, alert.initialRange), Infinity);
        const maxRange = relatedAlerts.reduce((max, alert) => Math.max(max, alert.finalRange), -Infinity);
        const alert = relatedAlerts.find(alert => value >= alert.initialRange && value <= alert.finalRange);

        if (alert && alert.level > nivel) {
          nivel = alert.level;
          color = alert.color;
        }

        return {
          name: mappedData.label,
          value: `${value} ${mappedData.unit}`,
          minRange,
          maxRange,
          alert: alert ? {
            name: alert.displayName,
            color: alert.color,
            level: alert.level,
          } : undefined
        };
      });

      return {
        id: entity.id,
        type: entity.type,
        timestamp,
        variables,
        raw: entity,
        nivel,
        color
      };
    });

    res.json(mappedMessages);
  } catch (error) {
    console.error("Error mapeando mensajes:", error);
    res.status(500).json({ message: "Error al procesar mensajes Orion." });
  }
});
 
// WebSocket listeners
io.on("connection", (socket) => {
  console.log("🔌 Cliente WebSocket conectado:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Cliente WebSocket desconectado:", socket.id);
  });
});

// Rutas del proyecto
app.use(statusRoutes);
app.use(authModule);
app.use(orionRoutes);
app.use(fiwareModule);

// Iniciar servidor
const PORT = process.env.PORT || 8090;
server.listen(PORT, () => {
  console.log("🚀 Server is running on port " + PORT);
});
