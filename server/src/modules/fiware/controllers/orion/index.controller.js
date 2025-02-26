import axios from 'axios';
import yaml from 'js-yaml';

const ORION_BASE_URL = "https://orion.sima.udb.edu.sv/v2/";
const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

// Función para obtener el mapeo desde el archivo YML
const getSensorMapping = async () => {
    try {
        const response = await axios.get(MAPPING_YML_URL);
        const ymlData = yaml.load(response.data); // Carga el archivo YAML
        const mappings = ymlData.mappings;

        // Transformar el formato para hacer más fácil el acceso
        const sensorMapping = {};
        for (const [label, data] of Object.entries(mappings)) {
            // Eliminar los corchetes de las claves
            const cleanLabel = label.replace(/[\[\]]/g, '').trim();
            
            data.alias.forEach(alias => {
                sensorMapping[alias] = cleanLabel;
            });
        }

        return sensorMapping;
    } catch (error) {
        console.error("Error obteniendo el archivo YML:", error);
        return {}; // Retorna un objeto vacío en caso de error
    }
};

export const getEntities = async (req, res) => {
    try {
        const headers = {
            'Fiware-Service': req.headers['fiware-service'] || 'default',
            'Fiware-ServicePath': req.headers['fiware-servicepath'] || '/'
        };

        const params = {
            type: req.query.type || undefined,
            limit: req.query.limit || 100
        };

        const url = `${ORION_BASE_URL}entities`;
        console.log("🟢 Enviando solicitud a Orion:", url);

        const sensorMapping = await getSensorMapping(); // Obtener el mapeo desde el YAML

        const response = await axios.get(url, { headers, params });

        const entities = response.data.map(entity => ({
            ...entity, // Mantiene toda la estructura original
            sensors: entity.sensors?.value ? 
                Object.fromEntries(
                    Object.entries(entity.sensors.value).map(([key, value]) => [
                        sensorMapping[key] || key, value // Utiliza el mapeo desde el YAML
                    ])
                ) : entity.sensors // Si no hay `sensors`, lo deja como está
        }));

        res.json(entities);
    } catch (error) {
        console.error("🔴 Error obteniendo entidades de Orion:", error);

        if (error.response) {
            console.error("🔸 Código de estado:", error.response.status);
            console.error("🔸 Respuesta del servidor:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("🔸 No hubo respuesta de Orion.");
            res.status(500).json({ error: "Orion no responde." });
        } else {
            console.error("🔸 Error en la petición:", error.message);
            res.status(500).json({ error: "Error en la API" });
        }
    }
};

export const getTypes = async (req, res) => {
    try {
        const headers = {
            'Fiware-Service': req.headers['fiware-service'] || 'default',
            'Fiware-ServicePath': req.headers['fiware-servicepath'] || '/'
        };
        const params = {
            type: req.query.type || undefined,
            limit: req.query.limit || 100,
            offset: req.query.offset || 0
        };

        const url = `${ORION_BASE_URL}types`;
        console.log("🟢 Enviando solicitud a Orion:", url);

        const response = await axios.get(url, { headers, params });
        res.json(response.data);
    } catch (error) {
        console.error("🔴 Error obteniendo tipos de entidades de Orion:", error);

        if (error.response) {
            console.error("🔸 Código de estado:", error.response.status);
            console.error("🔸 Respuesta del servidor:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("🔸 No hubo respuesta de Orion.");
            res.status(500).json({ error: "Orion no responde." });
        } else {
            console.error("🔸 Error en la petición:", error.message);
            res.status(500).json({ error: "Error en la API" });
        }
    }
};

export const getSubscriptions = async (req, res) => {
    try {
        const headers = {
            'Fiware-Service': req.headers['fiware-service'] || 'default',
            'Fiware-ServicePath': req.headers['fiware-servicepath'] || '/'
        };
        const params = {
            type: req.query.type || undefined,
            limit: req.query.limit || 100,
            offset: req.query.offset || 0
        };
        const url = `${ORION_BASE_URL}subscriptions`;
        console.log("🟢 Enviando solicitud a Orion:", url);

        const response = await axios.get(url, { headers, params });
        res.json(response.data);
    } catch (error) {
        console.error("🔴 Error obteniendo suscripciones de Orion:", error);

        if (error.response) {
            console.error("🔸 Código de estado:", error.response.status);
            console.error("🔸 Respuesta del servidor:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("🔸 No hubo respuesta de Orion.");
            res.status(500).json({ error: "Orion no responde." });
        } else {
            console.error("🔸 Error en la petición:", error.message);
            res.status(500).json({ error: "Error en la API" });
        }
    }
};

export const getRegistrations = async (req, res) => {
    try {
        const headers = {
            'Fiware-Service': req.headers['fiware-service'] || 'default',
            'Fiware-ServicePath': req.headers['fiware-servicepath'] || '/'
        };

        const params = {
            limit: req.query.limit || 100,
            offset: req.query.offset || 0
        };

        const url = `${ORION_BASE_URL}registrations`;
        console.log("🟢 Enviando solicitud a Orion:", url);

        const response = await axios.get(url, { headers, params });

        // Aquí puedes mapear la respuesta para que tenga la estructura que necesitas
        const notifications = response.data.map(notification => ({
            id: notification.id,
            description: notification.description,
            dataProvided: {
                entities: notification.dataProvided?.entities || [],
                attrs: notification.dataProvided?.attrs || []
            },
            provider: notification.provider || {},
            status: notification.status || "unknown"
        }));

        res.json(notifications);
    } catch (error) {
        console.error("🔴 Error obteniendo notificaciones de Orion:", error);

        if (error.response) {
            console.error("🔸 Código de estado:", error.response.status);
            console.error("🔸 Respuesta del servidor:", error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            console.error("🔸 No hubo respuesta de Orion.");
            res.status(500).json({ error: "Orion no responde." });
        } else {
            console.error("🔸 Error en la petición:", error.message);
            res.status(500).json({ error: "Error en la API" });
        }
    }
};
