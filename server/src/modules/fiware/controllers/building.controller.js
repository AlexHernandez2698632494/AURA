import Building from "../models/building.models.js";
import { Authority } from "../../auth/models/authorities.models.js";
import { connectDB } from "../../../config/db.js";
import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";

// Configurar GridFS Storage
const storage = new GridFsStorage({
  db: connectDB, // Pasa la conexión establecida para usarla con GridFS
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads", // Nombre del bucket en GridFS
    };
  },
});

export const upload = multer({ storage });

// Crear un nuevo edificio
export const createBuilding = async (req, res) => {
    try {
      const { nombre, nivel, locacion, autoridad } = req.body;
  
      // Validar la autoridad en la colección Authority
      const authority = await Authority.findOne({ type: autoridad });
      if (!authority) {
        return res.status(400).json({ message: "Autoridad no válida" });
      }
  
      // Verificar y convertir locacion a un arreglo de números si es necesario
      let locacionArray = [];
      if (typeof locacion === 'string') {
        console.log("locacion como string:", locacion);
        // Intentar dividir el string y convertirlo a números
        locacionArray = locacion.split(',').map(coord => parseFloat(coord.trim()));
      } else if (Array.isArray(locacion)) {
        console.log("locacion como array:", locacion);
        locacionArray = locacion.map(coord => parseFloat(coord));
      }
  
      console.log("locacionArray después de la conversión:", locacionArray);
  
      // Validar si locacion tiene dos elementos y son números válidos
      if (locacionArray.length !== 2 || locacionArray.some(isNaN)) {
        console.log("Error en validación de locacion:", locacionArray);
        return res.status(400).json({ message: "Locación debe contener latitud y longitud válidas" });
      }
  
      // Guardar imágenes en GridFS
      const imagenPrincipal = req.file ? req.file.filename : null;
  
      // Crear el edificio
      const nuevoEdificio = new Building({
        nombre,
        nivel,
        imagenPrincipal,
        imagenesPorNivel: [], // Se agregarán luego
        locacion: locacionArray,
        autoridad: authority._id,
        enable: true,
        estadoEliminacion: 0,
      });
  
      await nuevoEdificio.save();
      res.status(201).json({ message: "Edificio creado con éxito", building: nuevoEdificio });
    } catch (error) {
      console.log("Error al crear edificio:", error);
      res.status(500).json({ message: "Error al crear el edificio", error });
    }
  };
    

// Obtener todos los edificios
export const getBuildings = async (req, res) => {
  try {
    const buildings = await Building.find();
    res.json(buildings);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener edificios", error });
  }
};
