import { listarPermisosService } from '../services/permisos_services.js'

export const getPermisos = async (_, res) => {
  try {
    const permisos = await listarPermisosService()
    res.status(200).json(permisos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
