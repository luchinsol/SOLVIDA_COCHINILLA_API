import {
    listarRolesService,
    createRoleService,
    updateRoleService,
    deleteRoleService
} from '../services/roles_services.js';

export const getRoles = async (req, res) => {
    try {
        const roles = await listarRolesService();
        res.status(200).json(roles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRole = async (req, res) => {
    try {
        const role = req.body;
        const newRole = await createRoleService(role);
        res.status(201).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const role = req.body;
        const updatedRole = await updateRoleService(id, role);
        if (!updatedRole) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        res.status(200).json({ message: `Rol ${id} actualizado`, data: updatedRole });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteRole = async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await deleteRoleService(id);
        if (!deleted) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        res.status(200).json({ message: `Rol ${id} eliminado` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};