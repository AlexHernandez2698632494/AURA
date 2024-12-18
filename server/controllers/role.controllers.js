import { Role } from "../models/role.models.js";

// Obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find({ estadoEliminacion: 0 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getDeleteRoles = async (req, res) => {
  try {
    const roles = await Role.find({ estadoEliminacion: 1 });
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un rol por ID, asegurándose de que estadoEliminacion sea 0
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findOne({ 
      _id: req.params.id, 
      estadoEliminacion: 0 
    });
    if (!role) return res.status(404).json({ message: "Role no encontrado o eliminado" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Crear un nuevo rol
export const createRole = async (req, res) => {
  const { name } = req.body;

  try {
    // Obtener el último roleId
    const lastRole = await Role.findOne().sort({ roleId: -1 });
    const roleId = lastRole ? lastRole.roleId + 1 : 1;

    // Crear el nuevo rol con el campo estadoEliminacion (por defecto 0 = activo)
    const newRole = new Role({ 
      roleId, 
      name, 
      estadoEliminacion: 0 // 0: activo por defecto
    });

    await newRole.save();

    res.status(201).json({ message: "Role creado exitosamente", role: newRole });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Actualizar un rol
export const updateRole = async (req, res) => {
  const { name } = req.body;

  try {
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true } // Devuelve el rol actualizado
    );
    if (!role) return res.status(404).json({ message: "Role no encontrado" });
    res.json({ message: "Role actualizado exitosamente", role });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Modificar el estadoEliminacion de un rol (a 1)
export const deleteRole = async (req, res) => {
  try {
    // Buscar el rol por ID y actualizar su estadoEliminacion a 1
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { estadoEliminacion: 1 }, // Cambiar estadoEliminacion a 1 (eliminado)
      { new: true } // Devuelve el rol actualizado
    );
    
    // Si no se encuentra el rol
    if (!role) return res.status(404).json({ message: "Role no encontrado" });
    
    res.json({ message: "Role eliminado exitosamente", role });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

