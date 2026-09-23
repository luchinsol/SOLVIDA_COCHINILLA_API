import {
  obtenerStockPorAlmacenService,
  obtenerStockPorItemService
} from '../services/stock_item_almacen_services.js'
import { handleControllerError } from '../../../utils/handle_controller_error.js'

const normalizeStockItemAlmacenError = (error) => {
  if (
    error.message === 'item_id debe ser un entero positivo' ||
    error.message === 'almacen_id debe ser un entero positivo' ||
    error.message === 'incluir_agotados debe ser true o false'
  ) {
    error.name = 'ValidationError'
  }

  return error
}

export const obtenerStockPorItemController = async (req, res) => {
  try {
    const data = await obtenerStockPorItemService(req.params.itemId, req.query)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeStockItemAlmacenError(error))
  }
}

export const obtenerStockPorAlmacenController = async (req, res) => {
  try {
    const data = await obtenerStockPorAlmacenService(req.params.almacenId, req.query)
    res.json(data)
  } catch (error) {
    handleControllerError(res, normalizeStockItemAlmacenError(error))
  }
}
