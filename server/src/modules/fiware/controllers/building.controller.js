import building from '../models/building.models.js'; // Importar el modelo de Building
import { Authority } from '../../auth/models/authorities.models.js'; // Importar el modelo de Authority

// Función para crear un edificio
export const createBuilding = async (req, res) => {
  try {
      const { nombre, nivel, localizacion, authorities,mainImage,imageForPlant } = req.body;

      // Asegurarse de que la localizacion esté en el formato correcto [lat, lon]
      let localizacionArray = JSON.parse(localizacion); // Convertir la localización desde un string a un arreglo
      if (!Array.isArray(localizacionArray) || localizacionArray.length !== 2 || isNaN(localizacionArray[0]) || isNaN(localizacionArray[1])) {
          return res.status(400).json({ message: 'La localización debe ser un arreglo válido de [latitud, longitud].' });
      }

      // Buscar la autoridad por su "type"
      const foundAuthority = await Authority.findOne({ type: authorities });

      if (!foundAuthority) {
          return res.status(400).json({ message: `La autoridad con el tipo ${authorities} no fue encontrada.` });
      }

      
      // Crear el nuevo edificio en la base de datos
      const nuevoEdificio = new building({
          nombre,
          nivel,
          imagenPrincipal: mainImage,
          imagenesPlantas: imageForPlant,
          localizacion: localizacionArray, // Aquí se asegura de que sea el arreglo correcto
          authorities: foundAuthority._id,
          enabled: true,
      });

      await nuevoEdificio.save();

      return res.status(201).json({ message: 'Edificio creado con éxito', edificio: nuevoEdificio });
  } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Hubo un error al crear el edificio.' });
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