import building from "../models/building.models.js";
import { Authority } from "../../auth/models/authorities.models.js";
import mongoose from "mongoose";
import { Readable } from "stream";
import { connectDB } from "../../../config/db.js";
import { GridFSBucket } from "mongodb";

// Función para validar la localización
const validarLocalizacion = (localizacion) => {
  try {
    const localizacionArray = JSON.parse(localizacion); // Convertir la localización desde un string a un arreglo
    if (
      !Array.isArray(localizacionArray) ||
      localizacionArray.length !== 2 ||
      isNaN(localizacionArray[0]) ||
      isNaN(localizacionArray[1])
    ) {
      return { error: "La localización debe ser un arreglo válido de [latitud, longitud]." };
    }
    return { localizacionArray };
  } catch (error) {
    return { error: "Error al procesar la localización. Asegúrate de que esté en formato JSON." };
  }
};

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

// Función para crear un edificio
export const createBuilding = async (req, res) => {
  try {
    const {
      nombre,
      nivel,
      localizacion,
      authorities,
    } = req.body;

    // Validar archivos
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    // Validar localización
    const { error: errorLocalizacion, localizacionArray } = validarLocalizacion(localizacion);
    if (errorLocalizacion) {
      return res.status(400).json({ message: errorLocalizacion });
    }

    // Buscar la autoridad por su "type"
    const foundAuthority = await Authority.findOne({ type: authorities });
    if (!foundAuthority) {
      return res.status(400).json({ message: `La autoridad con el tipo ${authorities} no fue encontrada.` });
    }

    // Verificar que los archivos estén presentes en req.files
    if (!req.files || !req.files.mainImage || !req.files.imageForPlant) {
      return res.status(400).json({ message: "Faltan archivos en la solicitud." });
    }

    // Conectar con GridFS
    const bucket = new mongoose.mongo.GridFSBucket(connectDB.db, { bucketName: "images" });

    // Subir la imagen principal
    let mainImageId;
    try {
      mainImageId = await subirImagenAGridFS(bucket, req.files.mainImage[0]);
    } catch (err) {
      return res.status(500).json({ message: "Error al subir la imagen principal.", error: err });
    }

    // Subir las imágenes de las plantas
    let imageForPlantIds = [];
    try {
      imageForPlantIds = await Promise.all(
        req.files.imageForPlant.map(async (plantImageFile) => {
          return await subirImagenAGridFS(bucket, plantImageFile);
        })
      );
    } catch (err) {
      return res.status(500).json({ message: "Error al subir las imágenes de las plantas.", error: err });
    }

    // Crear el nuevo edificio
    const nuevoEdificio = new building({
      nombre,
      nivel,
      imagenPrincipal: mainImageId, // Guardar el ID de la imagen principal
      imagenesPlantas: imageForPlantIds, // Guardar los IDs de las imágenes de plantas
      localizacion: localizacionArray,
      authorities: foundAuthority._id,
    });

    await nuevoEdificio.save();

    return res.status(201).json({
      message: "Edificio creado con éxito",
      edificio: nuevoEdificio,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Hubo un error al crear el edificio.",
      error: error.message,
    });
  }
};

export const getBuildings = async (req, res) => {
  try {
    const buildings = await building.find({
      enabled: true,
      estadoEliminacion: 0,
    });

    res.status(200).json(buildings);
  } catch (error) {
    console.error("Error obteniendo los edificios:", error);
    res.status(500).json({ message: "Error al obtener los edificios." });
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
    bucketName: "images",
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
