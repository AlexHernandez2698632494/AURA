import Alert from "../models/Alert.models.js";
import axios from "axios";
import yaml from "js-yaml";

const MAPPING_YML_URL = "https://raw.githubusercontent.com/AlexHernandez2698632494/IoT/refs/heads/master/server/src/modules/config/ngsi.api.service.yml";

export const createAlert = async (req, res) => {
  try {
      // Verificar que los campos necesarios están presentes en el cuerpo de la solicitud
      const { variable, displayName, initialRange, finalRange, color, level } = req.body;
      
      if (!variable || !displayName || !initialRange || !finalRange || !color || !level) {
          return res.status(400).json({
              message: 'Faltan campos obligatorios: variable, displayName, initialRange, finalRange, color, level.'
          });
      }

      // Crear y guardar la nueva alerta
      const alert = new Alert(req.body);
      await alert.save();

      res.status(201).json(alert);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
};

export const getAlerts = async (req, res) => {
  const { page = 0, size = 10 } = req.query;
  try {
    const alerts = await Alert.find({ estadoEliminacion: 0 })
      .skip(page * size)
      .limit(Number(size));
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
    try {
        const alert = await Alert.findByIdAndUpdate(id, req.body , {new: true});
        if(!alert){
            return res.status(404).json({message: "Alert not found"});
        }
        res.json(alert);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

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

const gerSensorMapping = async () => {
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
