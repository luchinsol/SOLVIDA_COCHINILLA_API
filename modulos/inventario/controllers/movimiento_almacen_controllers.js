import {
  getMovimientosAlmacenService,
  createMovimientoAlmacenService,
  createAjusteMovimientoAlmacenService,
  createTrasladoMovimientoAlmacenService,
  updateMovimientoAlmacenService,
  deleteMovimientoAlmacenService
} from '../services/movimiento_almacen_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeMovimientoAlmacenError = (error) => {
  if (
    error.message === 'id es obligatorio' ||
    error.message === 'id debe ser un entero positivo' ||
    error.message === 'almacen_id es obligatorio' ||
    error.message === 'almacen_id debe ser un entero positivo' ||
    error.message === 'fecha_desde debe ser una fecha valida' ||
    error.message === 'fecha_hasta debe ser una fecha valida' ||
    error.message === 'fecha_desde no puede ser mayor que fecha_hasta' ||
    error.message === 'usuario_id debe ser un entero positivo' ||
    error.message === 'item_inventario_id es obligatorio' ||
    error.message === 'item_inventario_id debe ser un entero positivo' ||
    error.message === 'tipo_movimientos_almacen_id es obligatorio' ||
    error.message === 'tipo_movimientos_almacen_id debe ser un entero positivo' ||
    error.message === 'motivo_movimiento es obligatorio' ||
    error.message === 'cantidad es obligatoria' ||
    error.message === 'cantidad debe ser numerica' ||
    error.message === 'cantidad debe ser mayor a 0' ||
    error.message === 'stock_actual_corregido es obligatorio' ||
    error.message === 'stock_actual_corregido debe ser numerico' ||
    error.message === 'stock_actual_corregido no puede ser negativo' ||
    error.message === 'stock_inicial_corregido es obligatorio' ||
    error.message === 'stock_inicial_corregido debe ser numerico' ||
    error.message === 'stock_inicial_corregido no puede ser negativo' ||
    error.message === 'stock_actual_corregido no puede ser mayor que stock_inicial' ||
    error.message === 'stock_inicial_corregido no puede ser menor que stock_actual' ||
    error.message === 'motivo_movimiento no es valido para ajuste' ||
    error.message === 'almacen_destino_id no puede ser igual al almacen actual del lote' ||
    error.message === 'almacen_origen_id debe ser un entero positivo' ||
    error.message === 'almacen_destino_id debe ser un entero positivo' ||
    error.message === 'almacen_destino_id no puede ser igual a almacen_origen_id' ||
    error.message === 'delta del tipo de movimiento no es valido' ||
    error.message === 'El movimiento deja el stock_actual en negativo' ||
    error.message === 'almacen_origen_id no coincide con el almacen actual del lote' ||
    error.message === 'El item_inventario_id esta asociado a mas de un lote' ||
    error.message === 'El lote no tiene almacen actual para registrar una salida' ||
    error.message === 'El lote no tiene almacen actual para registrar un ajuste' ||
    error.message === 'El lote no tiene almacen actual para registrar un traslado'
  ) {
    error.name = 'ValidationError'
  }

  if (
    error.message === 'tipo_movimientos_almacen_id no encontrado' ||
    error.message === 'No se encontro un lote asociado al item_inventario_id'
  ) {
    error.name = 'NotFoundError'
  }

  return error
}

export const getMovimientosAlmacenController = async (req, res) => {
  try {
    const { almacen_id, codigo_item, nombre_item, tipo, fecha_desde, fecha_hasta } = req.query
    const movimientos = await getMovimientosAlmacenService({
      almacen_id,
      codigo_item,
      nombre_item,
      tipo,
      fecha_desde,
      fecha_hasta
    })
    res.json(movimientos)
  } catch (error) {
    handleControllerError(res, normalizeMovimientoAlmacenError(error))
  }
}

export const createMovimientoAlmacenController = async (req, res) => {
  try {
    const nuevoMovimiento = await createMovimientoAlmacenService(req.body)
    res.status(201).json(nuevoMovimiento)
  } catch (error) {
    handleControllerError(res, normalizeMovimientoAlmacenError(error))
  }
}

export const createAjusteMovimientoAlmacenController = async (req, res) => {
  try {
    const nuevoMovimiento = await createAjusteMovimientoAlmacenService(req.body)
    res.status(201).json(nuevoMovimiento)
  } catch (error) {
    handleControllerError(res, normalizeMovimientoAlmacenError(error))
  }
}

export const createTrasladoMovimientoAlmacenController = async (req, res) => {
  try {
    const nuevoMovimiento = await createTrasladoMovimientoAlmacenService(req.body)
    res.status(201).json(nuevoMovimiento)
  } catch (error) {
    handleControllerError(res, normalizeMovimientoAlmacenError(error))
  }
}

export const updateMovimientoAlmacenController = async (req, res) => {
  try {
    const { id } = req.params
    const movimientoActualizado = await updateMovimientoAlmacenService(id, req.body)
    res.json(movimientoActualizado)
  } catch (error) {
    handleControllerError(res, normalizeMovimientoAlmacenError(error))
  }
}

export const deleteMovimientoAlmacenController = async (req, res) => {
  try {
    const { id } = req.params
    const eliminado = await deleteMovimientoAlmacenService(id)
    res.json(eliminado)
  } catch (error) {
    handleControllerError(res, normalizeMovimientoAlmacenError(error))
  }
}
