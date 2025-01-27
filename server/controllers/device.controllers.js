import deviceModels from "../models/device.models.js";

// Crear dispositivo
export const createDevice = async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();
    res.status(201).json(device);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar dispositivos (excluye los eliminados lógicamente)
export const getDevices = async (req, res) => {
  try {
    const devices = await Device.find({ estadoEliminacion: 0 });
    res.json(devices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Actualizar dispositivo
export const updateDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }
    res.json(device);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar lógicamente
export const softDeleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, { estadoEliminacion: 1 });
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }
    res.json({ message: 'Dispositivo eliminado lógicamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Restaurar dispositivo
export const restoreDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(req.params.id, { estadoEliminacion: 0 });
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }
    res.json({ message: 'Dispositivo restaurado' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Eliminar físicamente
export const deleteDevice = async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Dispositivo no encontrado' });
    }
    res.json({ message: 'Dispositivo eliminado físicamente' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
