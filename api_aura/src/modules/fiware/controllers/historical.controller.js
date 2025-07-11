import axios from 'axios';
import yaml from 'js-yaml';
import fetch from 'node-fetch';
import moment from 'moment';
import { url_quantumleap,getSensorMapping } from '../../../utils/Github.utils.js';
// Obtener datos históricos desde QuantumLeap
async function getHistoricalData(entityId, attrName, fiwareService, fiwareServicePath) {
    const url = `${url_quantumleap}/entities/${entityId}/attrs/${attrName}`;

    const response = await axios.get(url, {
        headers: {
            'Fiware-Service': fiwareService,
            'Fiware-ServicePath': fiwareServicePath
        }
    });

    const historicalData = response.data;

    if (!historicalData.index || !historicalData.values) {
        throw new Error("No se encontraron datos históricos.");
    }

    // Combinar timestamp + valor
    return historicalData.index.map((timestamp, i) => ({
        timestamp,
        value: historicalData.values[i]
    }));
}

// Filtrar datos de las últimas 24 horas
function filterLast24Hours(data) {
    const now = moment();
    return data.filter(item => {
        const time = moment(item.timestamp);
        return now.diff(time, 'hours') <= 24;
    });
}

// Controlador principal
export async function getSensorHistorical(req, res) {
    const { entityId, attrName } = req.params;
    const fiwareService = req.headers['fiware-service'] || 'default';
    const fiwareServicePath = req.headers['fiware-servicepath'] || '/';

    try {
        const data = await getHistoricalData(entityId, attrName, fiwareService, fiwareServicePath);
        const filteredData = filterLast24Hours(data);

        // Obtener el mapeo de sensores
        const sensorMapping = await getSensorMapping();

        // Enriquecer los datos con nombre y unidad
        const enrichedValues = filteredData.map(entry => {
            const enrichedEntry = { timestamp: entry.timestamp };

            if (entry.value && typeof entry.value === 'object') {
                enrichedEntry.value = Object.entries(entry.value).map(([key, val]) => {
                    const mapping = sensorMapping[key] || { label: key, unit: null };
                    return {
                        name: mapping.label,
                        value: val,
                        unit: mapping.unit
                    };
                });
            } else {
                enrichedEntry.value = entry.value;
            }

            return enrichedEntry;
        });

        res.status(200).json({
            entityId,
            attrName,
            service: fiwareService,
            servicePath: fiwareServicePath,
            count: enrichedValues.length,
            values: enrichedValues
        });
    } catch (error) {
        console.error("Error al obtener históricos:", error.message);
        res.status(500).json({ error: error.message });
    }
}
