import Alert from "../models/Alert.models.js";
import axios from "axios";
import yaml from "js-yaml";

const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/AURA/refs/heads/master/api_aura/src/modules/config/ngsi.api.service.yml";

export const createAlert = async (req, res) => {
    const { variable, displayName, initialRange, finalRange, color, level } = req.body;

    try {
        // 1. Usar la variable de entorno para obtener la URL
        const mappingsUrl = process.env.MAPPINGS_URL;

        // 2. Validar que el valor de 'variable' esté en el endpoint /v1/ngsi/alerts/mappings
        const response = await axios.get(mappingsUrl);
        const validVariables = response.data; // Suponiendo que la respuesta es un array de valores

        if (!validVariables.includes(variable)) {
            return res.status(400).json({ message: 'El valor de "variable" no es válido.' });
        }

        // 3. Si la variable es válida, crear la alerta
        const alert = new Alert({
            variable,
            displayName,
            initialRange,
            finalRange,
            color,
            level
        });

        await alert.save();
        res.status(201).json(alert);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al crear la alerta.' });
    }
};

export const getAlerts = async (req, res) => {
  const { page = 0, size = 10 } = req.query;
  try {
    const alerts = await Alert.find({ estadoEliminacion: 0 })
    const totalElements = await Alert.countDocuments({ estadoEliminacion: 0 });

    res.json({
      content: alerts,
      pageable: {
        pageNumber: parseInt(page),
        pageSize: parseInt(size),
        paged: true,
        unpaged: false,
        offset: page * size,
      },
      totalPages: Math.ceil(totalElements / size),
      totalElements: totalElements,
      last: (page + 1) * size >= totalElements,
      size: size,
      number: parseInt(page),
      numberOfElements: alerts.length,
      first: page === 0,
      empty: alerts.length === 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateAlert = async (req, res) => {
    const { id } = req.params;
    const { variable, displayName, initialRange, finalRange, color, level } = req.body;

    try {
        // 1. Usar la variable de entorno para obtener la URL
        const mappingsUrl = process.env.MAPPINGS_URL;

        // 2. Validar que el valor de 'variable' esté en el endpoint /v1/ngsi/alerts/mappings
        const response = await axios.get(mappingsUrl);
        const validVariables = response.data; // Suponiendo que la respuesta es un array de valores

        if (!validVariables.includes(variable)) {
            return res.status(400).json({ message: 'El valor de "variable" no es válido.' });
        }

        // 3. Si la variable es válida, actualizar la alerta
        const alert = await Alert.findByIdAndUpdate(id, {
            variable,
            displayName,
            initialRange,
            finalRange,
            color,
            level
        }, { new: true });

        if (!alert) {
            return res.status(404).json({ message: 'Alerta no encontrada' });
        }

        res.status(200).json(alert);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al actualizar la alerta.' });
    }
};

export const deleteAlert = async (req, res) => {
    const { id } = req.params;
    try {
        const alert = await Alert.findByIdAndUpdate(id, {estadoEliminacion: 1}, {new: true});
        if(!alert){
            return res.status(404).json({message: "Alert not found"});
        }
        res.json(alert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const cleanSlateAlert = async (req, res) => {
    const { id } = req.params;
    try {
        const alert = await Alert.findByIdAndDelete(id);
        if(!alert){
            return res.status(404).json({message: "Alert not found"});
        }
        res.json({message: "Alert deleted permanently"});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const restoreAlert = async (req, res) => {
    const { id } = req.params;
    try {
        const alert = await Alert.findByIdAndUpdate(id, {estadoEliminacion: 0}, {new: true});
        if(!alert){
            return res.status(404).json({message: "Alert not found"});
        }
        res.json({message: "Alert restored"});
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

export const getMapping = async (req, res) => {
  try {
      const response = await axios.get(MAPPING_YML_URL); // Obtener el YAML directamente
      const ymlData = yaml.load(response.data); // Cargar el YAML

      // Extraer las claves de los mapeos (labels)
      const labels = Object.keys(ymlData.mappings).map(label => label.replace(/[\[\]]/g, '').trim());

      res.json(labels); // Devolver las etiquetas como un array
  } catch (error) {
      console.error("Error obteniendo el archivo YML:", error);
      res.status(500).json({ error: "Error al procesar el archivo YML." });
  }
};
