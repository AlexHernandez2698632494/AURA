import axios from 'axios';
import yaml from 'js-yaml';
import Alert from "../models/Alert.models.js";

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
        const headers = {
            'Fiware-Service': req.headers['fiware-service'] || 'default',
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

            // Determine the highest level and corresponding color
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