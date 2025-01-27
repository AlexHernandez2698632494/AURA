import serviceModels from "../models/service.models.js";
// Crear servicio
export const createService = async (req, res) => {
  try {
    const service = new Service(req.body);
    await service.save();
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Listar servicios
export const getServices = async (req, res) => {
  const services = await Service.find({ estadoEliminacion: 0 });
  res.json(services);
};

// Actualizar servicio
export const updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(service);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Eliminar lógicamente
export const softDeleteService = async (req, res) => {
  await Service.findByIdAndUpdate(req.params.id, { estadoEliminacion: 1 });
  res.json({ message: 'Servicio eliminado lógicamente.' });
};

// Restaurar
export const restoreService = async (req, res) => {
  await Service.findByIdAndUpdate(req.params.id, { estadoEliminacion: 0 });
  res.json({ message: 'Servicio restaurado.' });
};

// Eliminar físicamente
export const deleteService = async (req, res) => {
  await Service.findByIdAndDelete(req.params.id);
  res.json({ message: 'Servicio eliminado físicamente.' });
};
