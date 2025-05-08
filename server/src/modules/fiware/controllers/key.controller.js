import { Key } from '../models/key.models.js';
import { Authority } from '../../auth/models/authorities.models.js';

// Generar una API Key
export const generateApiKey = (req, res) => {
  const key = generateRandomString(7, 'abcdefghijklmnopqrstuvwxyz0123456789');
  res.json({ key });
};

// Generar un Device Key
export const generateDeviceKey = (req, res) => {
  const letters = generateRandomString(5, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  const numbers = generateRandomString(5, '0123456789');
  res.json({ key: `${letters}${numbers}` });
};

// Crear una API Key
export const createApiKey = async (req, res) => {
  try {
    const { key, type } = req.body;  // Recibimos 'type' en lugar de 'authority'
    
    // Buscar la autoridad por 'type' y asegurarnos de que no esté eliminada
    const authority = await Authority.findOne({
      type: type,
      estadoEliminacion: 0,  // Asegurarse de que la autoridad no esté eliminada
    });

    if (!authority) {
      return res.status(400).json({ error: 'Authority with the specified type not found or is deleted' });
    }

    // Crear el nuevo 'Key' usando la autoridad encontrada
    const newKey = new Key({
      type: 'apikey',
      key,
      authority: authority._id,  // Usamos el '_id' de la autoridad encontrada
    });
    await newKey.save();
    res.status(201).json(newKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear un Device Key
export const createDeviceKey = async (req, res) => {
  try {
    const { key, type } = req.body;  // Recibimos 'type' en lugar de 'authority'
    
    // Buscar la autoridad por 'type' y asegurarnos de que no esté eliminada
    const authority = await Authority.findOne({
      type: type,
      estadoEliminacion: 0,  // Asegurarse de que la autoridad no esté eliminada
    });

    if (!authority) {
      return res.status(400).json({ error: 'Authority with the specified type not found or is deleted' });
    }

    // Crear el nuevo 'Key' usando la autoridad encontrada
    const newKey = new Key({
      type: 'device',
      key,
      authority: authority._id,  // Usamos el '_id' de la autoridad encontrada
    });
    await newKey.save();
    res.status(201).json(newKey);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todas las API Keys
export const getApiKeys = async (req, res) => {
  try {
    const apiKeys = await Key.find({ type: 'apikey' }).populate('authority');
    res.json(apiKeys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener todos los Device Keys
export const getDeviceKeys = async (req, res) => {
  try {
    const deviceKeys = await Key.find({ type: 'device' }).populate('authority');
    res.json(deviceKeys);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Función de generación de cadenas aleatorias
function generateRandomString(length, charset) {
  let result = '';
  const characters = charset;
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
