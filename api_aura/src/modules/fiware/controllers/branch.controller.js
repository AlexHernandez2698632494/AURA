import building from "../models/building.models.js";
import Fiware from "../models/fiware.models.js"
import { Authority } from "../../auth/models/authorities.models.js";
import mongoose from "mongoose";
import { Readable } from "stream";
import { connectDB} from "../../../config/db.js";
import { getSalonModel } from "../models/branch.models.js";
import { GridFSBucket } from "mongodb";

// Función para subir una imagen a GridFS
const subirImagenAGridFS = async (bucket, file) => {
    return new Promise((resolve, reject) => {
      const readable = new Readable();
      const uploadStream = bucket.openUploadStream(file.originalname, {
        metadata: { mimetype: file.mimetype },
      });
  
      readable.push(file.buffer);
      readable.push(null);
      readable.pipe(uploadStream);
  
      uploadStream.on("error", (err) => {
        reject(err);
      });
  
      uploadStream.on("finish", () => {
        resolve(uploadStream.id); // ID del archivo subido
      });
    });
  };

// Función para reemplazar espacios, comas y puntos por "_"
const formatName = (text) => {
  return text.replace(/[ ,\.]/g, "_");
};

export const createBranch = async (req, res) => {
  try {
    const { nombre_salon, nivel, buildingName } = req.body;
    const fiwareService = req.headers['fiware-service'];
    const fiwareServicePath = req.headers['fiware-servicepath'];

    if (!fiwareService) {
      return res.status(400).json({
        message: 'Faltan los headers requeridos: Fiware-Service.'
      });
    } else if (!fiwareServicePath) {
      return res.status(400).json({ 
        message: 'Faltan los headers requeridos: Fiware-ServicePath.' 
      });
    }

    // Formatear nombres
    const formattedBuildingName = formatName(buildingName);
    const formattedBranchName = formatName(nombre_salon);

    // Buscar el edificio por su nombre original (no formateado)
    const foundBuilding = await building.findOne({ nombre: buildingName });
    if (!foundBuilding) {
      return res.status(400).json({
        message: `El Edificio o Sucursal ${buildingName} no fue encontrado.`,
      });
    }

    // Validar que la base de datos y colección existan
    const SalonModel = await getSalonModel(formattedBuildingName);

    if (!req.files || !req.files.imagen_salon) {
      return res.status(400).json({ message: "Falta la imagen del salón." });
    }

    // Subir imagen al GridFS
    const bucket = new mongoose.mongo.GridFSBucket(connectDB.db, { bucketName: "salones" });
    const imagenSalonId = await subirImagenAGridFS(bucket, req.files.imagen_salon[0]);

    const fiwareServicePathFormatted = `/${formattedBuildingName}/nivel_${nivel}/${formattedBranchName}`;

    const nuevoSalon = new SalonModel({
      nombre_salon: formattedBranchName,
      imagen_salon: imagenSalonId,
      edificioId: foundBuilding._id,
      nivel,
      fiware_servicepath: fiwareServicePathFormatted,
    });

    await nuevoSalon.save();

    const fiware = new Fiware({
      fiware_service: fiwareService,
      fiware_service_building: fiwareServicePath,
      fiware_servicepath: fiwareServicePathFormatted,
    });

    await fiware.save();

    return res.status(201).json({
      message: "Salón creado con éxito",
      salon: nuevoSalon,
    });
  } catch (error) {
    console.error("Error al crear el salón:", error);
    return res.status(500).json({
      message: "Hubo un error al crear el salón.",
      error: error.message,
    });
  }
};
  
// Función para obtener los salones de un edificio
export const getBranch = async (req, res) => {
    try {
      const { buildingName,nivel } = req.params;
  
      // Buscar el edificio por su nombre
      const foundBuilding = await building.findOne({ nombre: buildingName });
      if (!foundBuilding) {
        return res.status(400).json({
          message: `El Edificio o Sucursal ${buildingName} no fue encontrada.`,
        });
      }
  
      // Obtener el modelo de salón para la base de datos dinámica
      const SalonModel = await getSalonModel(buildingName);
      const filter = { nivel: nivel };
console.log(filter)
    // Filtrar los salones por el ID del edificio y el nivel
    const salones = await SalonModel.find({
        edificioId: foundBuilding._id,
        nivel: nivel, // Filtramos por nivel
      }).sort({ nombre_salon: 1 });;
  console.log(salones)
      return res.status(200).json({
        message: "Salones obtenidos con éxito",
        salones,
        buildingName,
        nivel
      });
    } catch (error) {
      console.error("Error al obtener los salones:", error);
      return res.status(500).json({
        message: "Hubo un error al obtener los salones.",
        error: error.message,
      });
    }
  };

// Función para obtener una imagen desde GridFS por su ID
export const getImageById = async (req, res, next) => {
  // Verificar si el ID es válido
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).send({ success: false, message: "Media not found" });
  }

  // Crear una instancia de GridFSBucket usando la conexión correcta
  const bucket = new mongoose.mongo.GridFSBucket(connectDB.db, {
    bucketName: "salones",
  });

  // Buscar el archivo en GridFS
  const cursor = bucket.find({
    _id: new mongoose.Types.ObjectId(req.params.id),
  }); // Uso de "new"

  try {
    // Convertir el cursor a un array para obtener los archivos
    const files = await cursor.toArray();

    if (!files.length) {
      return res
        .status(404)
        .send({ success: false, message: "Media not found" });
    }

    // Configurar los encabezados para la respuesta
    res.header("Content-Type", files[0].metadata.mimetype);
    res.header("Accept-Ranges", "bytes");

    // Iniciar el flujo de descarga desde GridFS y enviarlo al cliente
    const downloadStream = bucket.openDownloadStream(files[0]._id);
    downloadStream.pipe(res);
  } catch (err) {
    next(err); // Manejar errores si ocurren
  }
};
