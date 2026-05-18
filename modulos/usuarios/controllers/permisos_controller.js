import { listarPermisosService, crearPermisoService } from '../services/permisos_services.js'

export const getPermisos = async (_, res) => {
  try {
    const permisos = await listarPermisosService()
    res.status(200).json(permisos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const postPermisos = async (req, res) => {
  try {
    const permiso = await crearPermisoService(req.body)
    res.status(201).json(permiso)
  } catch (error) {
    if (
      error.message === 'modulo es obligatorio' ||
      error.message === 'recurso es obligatorio' ||
      error.message === 'accion es obligatoria'
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: error.message })
  }
}
