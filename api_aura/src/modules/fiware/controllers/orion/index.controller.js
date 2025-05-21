import axios from 'axios';
import yaml from 'js-yaml';

const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/AURA/refs/heads/master/api_aura/src/modules/config/ngsi.api.service.yml";

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

// Función para modificar la entidad en Orion
export const updateEntity = async (req, res) => {
    try {
        const { 'fiware-service': fiware_service, 'fiware-servicepath': fiware_servicepath } = req.headers;
        const { address, location, linkGrafana } = req.body; // Recibir los datos desde el cuerpo de la solicitud
        const { deviceName } = req.params;

        // Validación de los headers
        if (!fiware_service || !fiware_servicepath) {
            return res.status(400).json({ error: 'Headers fiware-service y fiware-servicepath son requeridos' });
        }

        // Validación de los datos necesarios en el cuerpo de la solicitud
        // if (!address || !location || !linkGrafana) {
        //     return res.status(400).json({ error: 'deviceName, address, location y linkGrafana son requeridos' });
        // }

        // Validación de deviceName en los parámetros
        if (!deviceName) {
            return res.status(400).json({ error: 'deviceName es requerido' });
        }

        // Crear el objeto de datos con el formato que se requiere para Orion
        const data = {
            address: {
                type: "StructuredValue",
                value: address, // El valor de address recibido en el cuerpo
            },
            location: {
                type: "geo:json",
                value: location, // El valor de location recibido en el cuerpo
            },
            linkGrafana: {
                type: "Text",
                value: linkGrafana, // El valor de linkGrafana recibido en el cuerpo
            }
        };

        // Hacer la solicitud POST al servidor de Orion para modificar la entidad
        const response = await axios.post(`${ORION_BASE_URL}entities/${deviceName}/attrs`, data, {
            headers: {
                'Content-Type': 'application/json',
                'fiware-service': fiware_service,
                'fiware-servicepath': fiware_servicepath
            }
        });

        // Responder con el resultado
        res.status(response.status).json(response.data);

    } catch (error) {
        // Manejando el error de forma más detallada
        console.error('Error al modificar la entidad:', error.message);

        // Si el error tiene una respuesta (error.response), extraer detalles específicos
        const status = error.response?.status || 500;
        const errorMessage = error.response?.data || error.message;

        res.status(status).json({
            error: 'Error al comunicarse con Orion',
            details: errorMessage
        });
    }
};
