import axios from "axios";
import yaml from "js-yaml";

const MAPPING_YML_URL =
  "https://raw.githubusercontent.com/AlexHernandez2698632494/AURA/refs/heads/master/api_aura/src/modules/config/ngsi.api.service.yml";

async function getConfig() {
  const response = await fetch(MAPPING_YML_URL, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github.v3.raw",
    },
  });

  if (!response.ok) {
    throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
  }

  const text = await response.text();
  const config = yaml.load(text);
  return config.sensors;
}

const config = await getConfig();
export const url_orion = config.url_orion.replace("https://", "http://");
export const url_json = config.url_json.replace("https://", "http://");
export const url_lorawan = config.url_lorawan.replace("https://", "http://");
export const url_mqtt = config.url_mqtt.replace("https://", "http://");
export const url_quantumleap = config.url_quantumleap.replace(
  "https://",
  "http://"
);

export const getSensorMapping = async () => {
    try {
        const response = await axios.get(MAPPING_YML_URL, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            }
        });

        const ymlData = yaml.load(response.data);

        const mappings = ymlData.mappings;

    const sensorMapping = {};
    for (const [label, data] of Object.entries(mappings)) {
      const cleanLabel = label.replace(/[\[\]]/g, "").trim();
      data.alias.forEach((alias) => {
        sensorMapping[alias] = { label: cleanLabel, unit: data.unit };
      });
    }

    return sensorMapping;
  } catch (error) {
    console.error("Error obteniendo el archivo YML:", error);
    return {};
  }
};