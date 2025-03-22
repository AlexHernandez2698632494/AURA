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
      return {
        error:
          "La localización debe ser un arreglo válido de [latitud, longitud].",
      };
    }
    return { localizacionArray };
  } catch (error) {
    return {
      error:
        "Error al procesar la localización. Asegúrate de que esté en formato JSON.",
    };
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
    const { nombre, nivel, localizacion, authorities } = req.body;

    // Validar archivos
    if (req.fileValidationError) {
      return res.status(400).json({ message: req.fileValidationError });
    }

    // Validar localización
    const { error: errorLocalizacion, localizacionArray } =
      validarLocalizacion(localizacion);
    if (errorLocalizacion) {
      return res.status(400).json({ message: errorLocalizacion });
    }

    // Buscar la autoridad por su "type"
    const foundAuthority = await Authority.findOne({ type: authorities });
    if (!foundAuthority) {
      return res
        .status(400)
        .json({
          message: `La autoridad con el tipo ${authorities} no fue encontrada.`,
        });
    }

    // Verificar que los archivos estén presentes en req.files
    if (!req.files || !req.files.mainImage || !req.files.imageForPlant) {
      return res
        .status(400)
        .json({ message: "Faltan archivos en la solicitud." });
    }

    // Conectar con GridFS
    const bucket = new mongoose.mongo.GridFSBucket(connectDB.db, {
      bucketName: "images",
    });

    // Subir la imagen principal
    let mainImageId;
    try {
      mainImageId = await subirImagenAGridFS(bucket, req.files.mainImage[0]);
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Error al subir la imagen principal.", error: err });
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
      return res
        .status(500)
        .json({
          message: "Error al subir las imágenes de las plantas.",
          error: err,
        });
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

//Funcion para editar un edificio
export const updateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, nivel, authorities } = req.body;

    // Buscar el edificio a editar
    const edificio = await building.findById(id);
    if (!edificio) {
      return res.status(404).json({ message: "Edificio no encontrado." });
    }

    // Validar el nivel: no se puede editar si el nivel es menor o igual al nivel actual
    if (nivel <= edificio.nivel) {
      return res.status(400).json({ message: "El nivel debe ser mayor al nivel actual." });
    }

    // Si authorities está presente, buscar la autoridad
    let autoridadId = edificio.authorities;  // Mantener la autoridad actual si no se edita

    if (authorities) {
      const foundAuthority = await Authority.findOne({ type: authorities });
      if (!foundAuthority) {
        return res.status(400).json({
          message: `La autoridad con el tipo ${authorities} no fue encontrada.`,
        });
      }
      autoridadId = foundAuthority._id; // Actualizar solo si se encuentra la nueva autoridad
    }

    // Verificar si hay cambios en las imágenes de las plantas solo si el nivel cambia
    let imageForPlantIds = [...edificio.imagenesPlantas];

    if (nivel !== edificio.nivel) {
      // Si el nivel cambia, hay que asegurarse de que las imágenes de las plantas estén correctamente asociadas con los niveles
      if (req.files && req.files.imageForPlant) {
        // Si se envían nuevas imágenes de plantas, agregarlas
        const bucket = new mongoose.mongo.GridFSBucket(connectDB.db, { bucketName: "images" });
        try {
          const newImagesForPlant = await Promise.all(
            req.files.imageForPlant.map(async (plantImageFile) => {
              return await subirImagenAGridFS(bucket, plantImageFile);
            })
          );
          // Agregar las nuevas imágenes a las existentes si el nivel aumenta
          imageForPlantIds = [...imageForPlantIds, ...newImagesForPlant];
        } catch (err) {
          return res.status(500).json({
            message: "Error al subir las imágenes de las plantas.",
            error: err,
          });
        }
      }

      // Si el nivel es menor, ajustar la cantidad de imágenes de plantas para que coincida con el nuevo nivel
      if (nivel < edificio.nivel) {
        imageForPlantIds = imageForPlantIds.slice(0, nivel);  // Mantener solo las imágenes correspondientes al nivel
      }
    }

    // Si no se cambia el nivel, las imágenes de plantas no deben modificarse
    if (nivel === edificio.nivel) {
      imageForPlantIds = edificio.imagenesPlantas;  // No modificar imágenes si el nivel no cambia
    }

    // Si se edita el nivel y no viene una nueva imagen, retorna error
    if (nivel !== undefined && !req.files?.mainImage && !req.files?.imageForPlant) {
      return res.status(400).json({ message: "Debe proveer una imagen al editar el nivel." });
    }

    // Actualizar el edificio con los nuevos datos
    edificio.nombre = nombre || edificio.nombre;
    edificio.nivel = nivel || edificio.nivel;
    edificio.authorities = autoridadId; // Mantener la autoridad actual si no se edita
    edificio.imagenesPlantas = imageForPlantIds; // Actualizar las imágenes de las plantas
    if (req.files && req.files.mainImage) {
      const bucket = new mongoose.mongo.GridFSBucket(connectDB.db, { bucketName: "images" });
      try {
        edificio.imagenPrincipal = await subirImagenAGridFS(bucket, req.files.mainImage[0]);
      } catch (err) {
        return res.status(500).json({ message: "Error al subir la imagen principal.", error: err });
      }
    }

    await edificio.save();

    return res.status(200).json({
      message: "Edificio actualizado con éxito.",
      edificio,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Hubo un error al editar el edificio.",
      error: error.message,
    });
  }
};

//FUncion para eliminar un edificio
export const deleteBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const edificio = await building.findById(id);
    if (!edificio) {
      return res.status(404).json({ message: "Edificio no encontrado." });
    } else {
      edificio.estadoEliminacion = 1;
      await edificio.save();
      return res.status(200).json({ message: "Edificio eliminado con éxito." });
    }
  } catch (error) {
    console.error("Error eliminando el edificio:", error);
    res.status(500).json({ message: "Error al eliminar el edificio." });
  }
};

//Funcion para restaurar un edificio
export const restoreBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    const edificio = await building.findById(id);
    if (!edificio) {
      return res.status(404).json({ message: "Edificio no encontrado." });
    } else {
      edificio.estadoEliminacion = 0;
      await edificio.save();
      return res
        .status(200)
        .json({ message: "Edificio restaurado con éxito." });
    }
  } catch (error) {
    console.error("Error restaurando el edificio:", error);
    res.status(500).json({ message: "Error al restaurar el edificio." });
  }
};

//Funcion borron y cuenta nueva para eliminar un edificio
export const cleanSlateBuilding = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el edificio en la base de datos
    const edificio = await building.findById(id);
    if (!edificio) {
      return res.status(404).json({ message: "Edificio no encontrado." });
    }

    // Conectar con GridFS para eliminar las imágenes
    const bucket = new mongoose.mongo.GridFSBucket(connectDB.db, {
      bucketName: "images",
    });

    // Eliminar la imagen principal
    if (edificio.imagenPrincipal) {
      try {
        await bucket.delete(edificio.imagenPrincipal); // Eliminar imagen principal
      } catch (error) {
        console.error("Error al eliminar la imagen principal:", error);
        return res.status(500).json({ message: "Error al eliminar la imagen principal." });
      }
    }

    // Eliminar las imágenes de las plantas
    if (edificio.imagenesPlantas && edificio.imagenesPlantas.length > 0) {
      try {
        for (let plantImageId of edificio.imagenesPlantas) {
          await bucket.delete(plantImageId); // Eliminar imágenes de las plantas
        }
      } catch (error) {
        console.error("Error al eliminar las imágenes de las plantas:", error);
        return res.status(500).json({ message: "Error al eliminar las imágenes de las plantas." });
      }
    }

    // Eliminar el edificio de la base de datos
    await building.findByIdAndDelete(id);

    return res.status(200).json({ message: "Edificio y sus imágenes eliminadas con éxito." });

  } catch (error) {
    console.error("Error al eliminar el edificio y las imágenes:", error);
    res.status(500).json({ message: "Error al eliminar el edificio y sus imágenes." });
  }
};
