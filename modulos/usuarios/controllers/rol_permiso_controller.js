import {
  listarPermisosPorRolService,
  obtenerVistaPermisosPorRolService,
  crearRolPermisoService,
  actualizarRolPermisoService
} from '../services/rol_permiso_services.js'

export const getPermisosPorRol = async (req, res) => {
  try {
    const { rol_id, modulo } = req.query
    const permisos = await listarPermisosPorRolService({ rol_id, modulo })
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

export const getVistaPermisosPorRol = async (req, res) => {
  try {
    const { rol_id, modulo } = req.query
    const vista = await obtenerVistaPermisosPorRolService({ rol_id, modulo })
    res.status(200).json(vista)
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

export const patchRolPermiso = async (req, res) => {
  try {
    const rolPermiso = await actualizarRolPermisoService(req.body)
    res.status(200).json(rolPermiso)
  } catch (error) {
    if (
      error.message === 'rol_id es obligatorio' ||
      error.message === 'rol_id debe ser un entero positivo' ||
      error.message === 'permiso_id debe ser un entero positivo' ||
      error.message === 'Debes enviar permiso_id o recurso y accion' ||
      error.message === 'activo debe ser booleano' ||
      error.message === 'Permiso no encontrado' ||
      error.message === 'No existe el permiso destino para ese recurso, accion y alcance'
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: error.message })
  }
}
