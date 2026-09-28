import {
  crearServicioAnalisisService,
  listarServiciosAnalisisService,
  obtenerDetalleServicioAnalisisService,
  obtenerResumenServiciosAnalisisService
} from '../services/servicio_analisis_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizarErrorServicio = (error) => {
  if (error.code === '23503' || error.code === '23514' || error.code === '23502') {
    error.name = 'ValidationError'
  } else if (error.code === '23505') {
    error.name = 'ConflictError'
  }
  return error
}

export const crearServicioAnalisisController = async (req, res) => {
  try {
    const servicio = await crearServicioAnalisisService(req.body, req.user.id)
    res.status(201).json(servicio)
  } catch (error) {
    handleControllerError(res, normalizarErrorServicio(error))
  }
}

export const listarServiciosAnalisisController = async (req, res) => {
  try {
    res.json(await listarServiciosAnalisisService(req.query))
  } catch (error) {
    handleControllerError(res, normalizarErrorServicio(error))
  }
}

export const obtenerResumenServiciosAnalisisController = async (_req, res) => {
  try {
    res.json(await obtenerResumenServiciosAnalisisService())
  } catch (error) {
    handleControllerError(res, normalizarErrorServicio(error))
  }
}

export const obtenerDetalleServicioAnalisisController = async (req, res) => {
  try {
    const servicio = await obtenerDetalleServicioAnalisisService(req.params.servicio_id)
    if (!servicio) return res.status(404).json({ error: 'servicio de análisis no encontrado' })
    res.json(servicio)
  } catch (error) {
    handleControllerError(res, normalizarErrorServicio(error))
  }
}
