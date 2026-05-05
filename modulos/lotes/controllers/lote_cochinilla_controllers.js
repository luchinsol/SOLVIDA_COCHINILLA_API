import {
  crearLoteCochinillaPorCompraService,
  crearLoteCochinillaPorMezclaService,
  listarLotesCochinillaService,
  obtenerLoteCochinillaPorIdService,
  actualizarAnalisisLoteCochinillaService,
  actualizarEstadoLoteCochinillaService,
  actualizarStockActualLoteCochinillaService,
  actualizarConsumoLoteCochinillaService,
  actualizarMasaLoteCochinillaPorDeltaService,
  eliminarLoteCochinillaService
} from '../services/lote_cochinilla_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeLoteCochinillaError = (error) => {
  if (
    error.message === 'Lote de cochinilla no encontrado'
  ) {
    error.name = 'NotFoundError'
  }

  if (
    error.message === 'id debe ser un entero positivo' ||
    error.message === 'almacen_id debe ser un entero positivo' ||
    error.message === 'proveedor_id debe ser un entero positivo' ||
    error.message === 'proveedor_id es obligatorio' ||
    error.message === 'almacen_id es obligatorio' ||
    error.message === 'fecha_compra es obligatoria' ||
    error.message === 'stock_inicial debe ser mayor a 0' ||
    error.message === 'costo_total_inicial debe ser mayor a 0' ||
    error.message === 'stock_inicial no puede ser negativo' ||
    error.message === 'estado_lote es obligatorio' ||
    error.message === 'stock_actual es obligatorio' ||
    error.message === 'stock_actual debe ser numérico' ||
    error.message === 'stock_actual no puede ser negativo' ||
    error.message === 'stock_actual no puede ser mayor que stock_inicial' ||
    error.message === 'masa_total_kg es obligatoria' ||
    error.message === 'La masa_total_kg no puede ser negativa' ||
    error.message === 'La masa nueva no puede ser mayor que la masa actual del lote' ||
    error.message === 'delta es obligatorio' ||
    error.message === 'delta debe ser numérico' ||
    error.message === 'La masa resultante no puede ser negativa' ||
    error.message === 'tipo_lote no válido para eliminación'
  ) {
    error.name = 'ValidationError'
  }

  return error
}

/* ======================================================
   CREATE
====================================================== */

// crear lote de cochinilla por compra
export const crearLoteCochinillaPorCompra = async (req, res) => {
  try {
    const data = await crearLoteCochinillaPorCompraService(req.body)
    res.status(201).json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

// crear lote de cochinilla por mezcla
export const crearLoteCochinillaPorMezcla = async (req, res) => {
  try {
    const data = await crearLoteCochinillaPorMezclaService(req.body)
    res.status(201).json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

/* ======================================================
   READ
====================================================== */
export const listarLotesCochinilla = async (req, res) => {
  try {
    const {
      almacen_id,
      calidad_cochinilla,
      tipo_lote,
      proveedor_id,
      estado_lote
    } = req.query

    const data = await listarLotesCochinillaService({
      almacen_id,
      calidad_cochinilla,
      tipo_lote,
      proveedor_id,
      estado_lote
    })
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

export const obtenerLoteCochinillaPorId = async (req, res) => {
  try {
    const { id } = req.params
    const data = await obtenerLoteCochinillaPorIdService(id)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

/* ======================================================
   UPDATE: análisis
====================================================== */
export const actualizarAnalisisLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarAnalisisLoteCochinillaService(id, req.body)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

export const actualizarEstadoLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarEstadoLoteCochinillaService(id, req.body)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

export const actualizarStockActualLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarStockActualLoteCochinillaService(id, req.body)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

/* ======================================================
   UPDATE: consumo
====================================================== */
export const actualizarConsumoLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarConsumoLoteCochinillaService(id, req.body)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

/* ======================================================
   UPDATE: actualizar masa por delta
====================================================== */
export const actualizarMasaLoteCochinillaPorDelta = async (req, res) => {
  try {
    const { id } = req.params
    const data = await actualizarMasaLoteCochinillaPorDeltaService(id, req.body)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}

/* ======================================================
   DELETE
====================================================== */
export const eliminarLoteCochinilla = async (req, res) => {
  try {
    const { id } = req.params
    const data = await eliminarLoteCochinillaService(id)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeLoteCochinillaError(error))
  }
}
