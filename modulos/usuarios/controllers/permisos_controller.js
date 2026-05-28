import {
  listarPermisosService,
  listarCatalogoPermisosService,
  crearPermisoService
} from '../services/permisos_services.js'

export const getPermisos = async (_, res) => {
  try {
    const permisos = await listarPermisosService()
    res.status(200).json(permisos)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}

export const getCatalogoPermisos = async (req, res) => {
  try {
    const catalogo = await listarCatalogoPermisosService(req.query)
    res.status(200).json(catalogo)
  } catch (error) {
    if (error.message === 'modulo_id debe ser un entero positivo') {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: error.message })
  }
}

export const postPermisos = async (req, res) => {
  try {
    const permiso = await crearPermisoService(req.body)
    res.status(201).json(permiso)
  } catch (error) {
    if (
      error.message === 'modulo_id es obligatorio' ||
      error.message === 'modulo_id debe ser un entero positivo' ||
      error.message === 'Modulo no encontrado' ||
      error.message === 'recurso es obligatorio' ||
      error.message === 'accion es obligatoria'
    ) {
      return res.status(400).json({ error: error.message })
    }

    res.status(500).json({ error: error.message })
  }
}
