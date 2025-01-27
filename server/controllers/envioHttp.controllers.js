import EnvioHttp from '../models/envioHttp.models.js';

// Crear un nuevo registro
export const createEnvioHttp = async (req, res) => {
  try {
    const envioHttp = new EnvioHttp(req.body);
    await envioHttp.save();
    res.status(201).json(envioHttp);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Obtener todos los registros activos (estadoEliminacion = 0)
export const getEnvioHttp = async (req, res) => {
  try {
    const envios = await EnvioHttp.find({ estadoEliminacion: 0 });
    res.json(envios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener un registro por ID
export const getEnvioHttpById = async (req, res) => {
  try {
    const envio = await EnvioHttp.findById(req.params.id);
    if (!envio) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json(envio);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar un registro por ID
export const updateEnvioHttp = async (req, res) => {
  try {
    const envio = await EnvioHttp.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!envio) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json(envio);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Cambiar el estado de eliminación a 1 (eliminación lógica)
export const softDeleteEnvioHttp = async (req, res) => {
  try {
    const envio = await EnvioHttp.findByIdAndUpdate(req.params.id, { estadoEliminacion: 1 });
    if (!envio) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro eliminado lógicamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restaurar un registro (cambiar estado de eliminación a 0)
export const restoreEnvioHttp = async (req, res) => {
  try {
    const envio = await EnvioHttp.findByIdAndUpdate(req.params.id, { estadoEliminacion: 0 });
    if (!envio) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro restaurado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar físicamente un registro
export const deleteEnvioHttp = async (req, res) => {
  try {
    const envio = await EnvioHttp.findByIdAndDelete(req.params.id);
    if (!envio) {
      return res.status(404).json({ message: 'Registro no encontrado' });
    }
    res.json({ message: 'Registro eliminado físicamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
