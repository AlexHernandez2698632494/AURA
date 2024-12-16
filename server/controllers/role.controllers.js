import { Role } from "../models/role.models.js";

// Obtener todos los roles
export const getRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener un rol por ID
export const getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: "Role no encontrado" });
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

    // Crear el nuevo rol
    const newRole = new Role({ roleId, name });
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

// Eliminar un rol
export const deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ message: "Role no encontrado" });
    res.json({ message: "Role eliminado exitosamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
