

export const getRoles = async (req, res) => {
    try {
        const roles = await listarRolesService();
        res.status(200).json(roles);
        // res.status(200).json({ message: 'Roles obtenidos' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getRoleById = async (req, res) => {
    try {
        const { id } = req.params;
        const role = await getRoleByIdService(id);
        if (!role) {
            return res.status(404).json({ message: 'Rol no encontrado' });
        }
        res.status(200).json(role);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createRole = async (req, res) => {
    try {
        const { name, description } = req.body;
        const newRole = await createRoleService(name, description);
        res.status(201).json({ message: 'Rol creado', data: newRole });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;
        const updatedRole = await updateRoleService(id, name, description);
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