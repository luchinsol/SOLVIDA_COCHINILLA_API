import db from '../../../config/database.js'
import {
  listarItemsPorAlmacenRepo,
  listarStockPorItemRepo,
  obtenerAlmacenStockRepo,
  obtenerItemStockRepo,
  obtenerStockTotalItemRepo
} from '../repositories/stock_item_almacen_repositories.js'

const parsePositiveInteger = (value, fieldName) => {
  const parsed = Number(value)

  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${fieldName} debe ser un entero positivo`)
  }

  return parsed
}

const parseIncluirAgotados = (value) => {
  if (value === undefined || value === '') {
    return false
  }

  const parsed = String(value).trim().toLowerCase()

  if (!['true', 'false'].includes(parsed)) {
    throw new Error('incluir_agotados debe ser true o false')
  }

  return parsed === 'true'
}

export const obtenerStockPorItemService = async (itemId, filters = {}) => {
  const itemInventarioId = parsePositiveInteger(itemId, 'item_id')
  const incluirAgotados = parseIncluirAgotados(filters.incluir_agotados)

  return await db.task(async (t) => {
    const item = await obtenerItemStockRepo(itemInventarioId, t)

    if (!item) {
      const error = new Error('Item de inventario no encontrado')
      error.name = 'NotFoundError'
      throw error
    }

    const [existencias, total] = await Promise.all([
      listarStockPorItemRepo(itemInventarioId, incluirAgotados, t),
      obtenerStockTotalItemRepo(itemInventarioId, t)
    ])

    return {
      ...item,
      stock_total: total.stock_total,
      existencias
    }
  })
}

export const obtenerStockPorAlmacenService = async (almacenId, filters = {}) => {
  const parsedAlmacenId = parsePositiveInteger(almacenId, 'almacen_id')
  const incluirAgotados = parseIncluirAgotados(filters.incluir_agotados)

  return await db.task(async (t) => {
    const almacen = await obtenerAlmacenStockRepo(parsedAlmacenId, t)

    if (!almacen) {
      const error = new Error('Almacen no encontrado')
      error.name = 'NotFoundError'
      throw error
    }

    const items = await listarItemsPorAlmacenRepo(
      parsedAlmacenId,
      incluirAgotados,
      t
    )

    return {
      ...almacen,
      items
    }
  })
}
