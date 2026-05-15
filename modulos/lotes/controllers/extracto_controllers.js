import {
  crearExtractoService,
  actualizarEstadoLoteExtractoService,
  actualizarStockActualExtractoService,
  listarExtractosService,
  obtenerResumenExtractosService
} from '../services/extracto_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeExtractoError = (error) => {
  if (
    error.message === 'id debe ser un entero positivo' ||
    error.message === 'almacen_id es obligatorio' ||
    error.message === 'almacen_id debe ser un entero positivo' ||
    error.message === 'proceso_filtrado_id es obligatorio' ||
    error.message === 'proceso_filtrado_id debe ser un entero positivo' ||
    error.message === 'nombre_extracto es obligatorio' ||
    error.message === 'tipo_extracto es obligatorio' ||
    error.message === 'stock_inicial es obligatorio' ||
    error.message === 'costo_total_inicial es obligatorio' ||
    error.message === 'stock_inicial debe ser numerico' ||
    error.message === 'stock_inicial no puede ser negativo' ||
    error.message === 'costo_total_inicial debe ser numerico' ||
    error.message === 'estado_lote es obligatorio' ||
    error.message === 'stock_actual es obligatorio' ||
    error.message === 'stock_actual debe ser numerico' ||
    error.message === 'stock_actual no puede ser negativo' ||
    error.message === 'stock_actual no puede ser mayor que stock_inicial'
  ) {
    error.name = 'ValidationError'
  }

  if (error.message === 'Extracto no encontrado') {
    error.name = 'NotFoundError'
  }

  return error
}

export const crearExtracto = async (req, res) => {
  try {
    const data = await crearExtractoService(req.body)
    res.status(201).json(data)
  } catch (error) {
    handleControllerError(res, normalizeExtractoError(error))
  }
}

export const listarExtractos = async (req, res) => {
  try {
    const { tipo_extracto, estado_lote, almacen_id, proceso_filtrado_id } = req.query

    const data = await listarExtractosService({
      tipo_extracto,
      estado_lote,
      almacen_id,
      proceso_filtrado_id
    })

    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeExtractoError(error))
  }
}

export const obtenerResumenExtractos = async (req, res) => {
  try {
    const data = await obtenerResumenExtractosService()
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeExtractoError(error))
  }
}

export const actualizarEstadoLoteExtracto = async (req, res) => {
  try {
    const { id } = req.params
    const { estado_lote } = req.body
    const data = await actualizarEstadoLoteExtractoService(id, estado_lote)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeExtractoError(error))
  }
}

export const actualizarStockActualExtracto = async (req, res) => {
  try {
    const { id } = req.params
    const { stock_actual } = req.body

    const data = await actualizarStockActualExtractoService(id, stock_actual, {
      usuario_id: req.body.usuario_id,
      motivo_movimiento: req.body.motivo_movimiento,
      observaciones: req.body.observaciones
    })

    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeExtractoError(error))
  }
}
