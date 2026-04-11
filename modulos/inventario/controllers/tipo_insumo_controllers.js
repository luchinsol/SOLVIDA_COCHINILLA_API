import {
  actualizarControladoTipoInsumoService,
  actualizarVigenciaTipoInsumoService,
  crearTipoInsumoService,
  obtenerTiposInsumoService
} from '../services/tipo_insumo_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeTipoInsumoError = (error) => {
  if (error.message === 'Tipo de insumo no encontrado') {
    error.name = 'NotFoundError'
  }

  if (
    error.message === 'El nombre es obligatorio' ||
    error.message === 'El campo controlado es obligatorio' ||
    error.message === 'Debe enviar el valor de vigente' ||
    error.message === 'Debe enviar el valor de controlado'
  ) {
    error.name = 'ValidationError'
  }

  return error
}

export const obtenerTiposInsumoController = async (req, res) => {
  try {
    const tiposInsumo = await obtenerTiposInsumoService()
    res.json(tiposInsumo)
  } catch (error) {
    handleControllerError(res, normalizeTipoInsumoError(error))
  }
}

export const actualizarVigenciaTipoInsumoController = async (req, res) => {
  try {
    const { id } = req.params
    const { vigente } = req.body
    const tipoInsumoActualizado = await actualizarVigenciaTipoInsumoService(id, vigente)
    res.json(tipoInsumoActualizado)
  } catch (error) {
    handleControllerError(res, normalizeTipoInsumoError(error))
  }
}

export const actualizarControladoTipoInsumoController = async (req, res) => {
  try {
    const { id } = req.params
    const { controlado } = req.body
    const tipoInsumoActualizado = await actualizarControladoTipoInsumoService(id, controlado)
    res.json(tipoInsumoActualizado)
  } catch (error) {
    handleControllerError(res, normalizeTipoInsumoError(error))
  }
}

// CREATE tipo_insumo
export const crearTipoInsumoController = async (req, res) => {
  try {
    const nuevoTipoInsumo = await crearTipoInsumoService(req.body)
    res.status(201).json(nuevoTipoInsumo)
  } catch (error) {
    handleControllerError(res, normalizeTipoInsumoError(error))
  }
}
