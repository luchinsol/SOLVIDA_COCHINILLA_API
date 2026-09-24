import db from '../../../config/database.js'
import {
  listarItemsPorAlmacenRepo,
  listarStockPorItemRepo,
  obtenerAlmacenStockRepo,
  obtenerItemStockRepo,
  obtenerResumenStockRepo,
  obtenerStockTotalItemRepo
} from '../repositories/stock_item_almacen_repositories.js'

const CATEGORIAS_STOCK = new Set(['insumos', 'cochinilla', 'carmin', 'extracto'])

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

export const obtenerResumenStockService = async (filters = {}) => {
  const categoria = String(filters.categoria || '').trim().toLowerCase()

  if (!CATEGORIAS_STOCK.has(categoria)) {
    throw new Error('categoria debe ser insumos, cochinilla, carmin o extracto')
  }

  const almacenId =
    filters.almacen_id === undefined || filters.almacen_id === ''
      ? null
      : parsePositiveInteger(filters.almacen_id, 'almacen_id')

  const tipoInsumoId =
    filters.tipo_insumo_id === undefined || filters.tipo_insumo_id === ''
      ? null
      : parsePositiveInteger(filters.tipo_insumo_id, 'tipo_insumo_id')

  const tipoLote =
    filters.tipo_lote === undefined || filters.tipo_lote === ''
      ? null
      : String(filters.tipo_lote).trim().toLowerCase()

  return await obtenerResumenStockRepo(categoria, almacenId, tipoInsumoId, tipoLote)
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
