import { listarPermisosPorRolService, crearRolPermisoService } from '../services/rol_permiso_services.js'

export const getPermisosPorRol = async (req, res) => {
  try {
    const { rol_id } = req.query
    const permisos = await listarPermisosPorRolService(rol_id)
    res.status(200).json(permisos)
  } catch (error) {
    if (
      error.message === 'rol_id es obligatorio' ||
      error.message === 'rol_id debe ser un entero positivo'
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: error.message })
  }
}

export const postRolPermiso = async (req, res) => {
  try {
    const rolPermiso = await crearRolPermisoService(req.body)
    res.status(201).json(rolPermiso)
  } catch (error) {
    if (
      error.message === 'rol_id es obligatorio' ||
      error.message === 'permiso_id es obligatorio' ||
      error.message === 'rol_id debe ser un entero positivo' ||
      error.message === 'permiso_id debe ser un entero positivo'
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: error.message })
  }
}
