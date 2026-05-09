import {
  crearExtractoRepo,
  actualizarEstadoLoteExtractoRepo,
  actualizarStockActualExtractoRepo,
  listarExtractosRepo,
  obtenerExtractoPorIdRepo
} from '../repositories/extracto_repositories.js'
import {
  actualizarCodigoItemInventarioRepo,
  crearItemInventarioRepo
} from '../../inventario/repositories/item_inventario_repositories.js'
import db from '../../../config/database.js'

export const crearExtractoService = async (data) => {
  if (data.almacen_id == null || data.almacen_id === '') {
    throw new Error('almacen_id es obligatorio')
  }

  const almacenId = Number(data.almacen_id)

  if (!Number.isInteger(almacenId) || almacenId <= 0) {
    throw new Error('almacen_id debe ser un entero positivo')
  }

  if (data.proceso_filtrado_id == null || data.proceso_filtrado_id === '') {
    throw new Error('proceso_filtrado_id es obligatorio')
  }

  const procesoFiltradoId = Number(data.proceso_filtrado_id)

  if (!Number.isInteger(procesoFiltradoId) || procesoFiltradoId <= 0) {
    throw new Error('proceso_filtrado_id debe ser un entero positivo')
  }

  if (!data.nombre_extracto || !data.nombre_extracto.trim()) {
    throw new Error('nombre_extracto es obligatorio')
  }

  if (!data.tipo_extracto || !data.tipo_extracto.trim()) {
    throw new Error('tipo_extracto es obligatorio')
  }

  if (data.stock_inicial == null || data.stock_inicial === '') {
    throw new Error('stock_inicial es obligatorio')
  }

  const stockInicial = Number(data.stock_inicial)

  if (Number.isNaN(stockInicial)) {
    throw new Error('stock_inicial debe ser numérico')
  }

  if (stockInicial < 0) {
    throw new Error('stock_inicial no puede ser negativo')
  }

  return await db.tx(async (t) => {
    const itemInventarioCreado = await crearItemInventarioRepo(
      {
        nombre_item: 'Extracto',
        codigo_item: 'EXT-PENDIENTE'
      },
      t
    )

    const itemInventario = await actualizarCodigoItemInventarioRepo(
      itemInventarioCreado.item_inventario_id,
      `EXT-${itemInventarioCreado.item_inventario_id}`,
      t
    )

    return await crearExtractoRepo({
      item_inventario_id: itemInventario.item_inventario_id,
      almacen_id: almacenId,
      proceso_filtrado_id: procesoFiltradoId,
      nombre_extracto: data.nombre_extracto.trim(),
      tipo_extracto: data.tipo_extracto.trim(),
      stock_inicial: stockInicial,
      stock_actual: stockInicial,
      estado_lote: 'disponible',
      observaciones: data.observaciones ?? null,
      unidad_medida_dinero: 'USD'
    }, t)
  })
}

export const listarExtractosService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.tipo_extracto !== undefined && filters.tipo_extracto.trim() !== '') {
    parsedFilters.tipo_extracto = filters.tipo_extracto.trim()
  }

  if (filters.estado_lote !== undefined && filters.estado_lote.trim() !== '') {
    parsedFilters.estado_lote = filters.estado_lote.trim()
  }

  if (filters.almacen_id !== undefined && filters.almacen_id !== '') {
    const almacenId = Number(filters.almacen_id)

    if (!Number.isInteger(almacenId) || almacenId <= 0) {
      throw new Error('almacen_id debe ser un entero positivo')
    }

    parsedFilters.almacen_id = almacenId
  }

  if (filters.proceso_filtrado_id !== undefined && filters.proceso_filtrado_id !== '') {
    const procesoFiltradoId = Number(filters.proceso_filtrado_id)

    if (!Number.isInteger(procesoFiltradoId) || procesoFiltradoId <= 0) {
      throw new Error('proceso_filtrado_id debe ser un entero positivo')
    }

    parsedFilters.proceso_filtrado_id = procesoFiltradoId
  }

  return await listarExtractosRepo(parsedFilters)
}

export const actualizarEstadoLoteExtractoService = async (id, estadoLote) => {
  const extractoId = Number(id)

  if (!Number.isInteger(extractoId) || extractoId <= 0) {
    throw new Error('id debe ser un entero positivo')
  }

  const extracto = await obtenerExtractoPorIdRepo(extractoId)

  if (!extracto) {
    throw new Error('Extracto no encontrado')
  }

  if (!estadoLote || !estadoLote.trim()) {
    throw new Error('estado_lote es obligatorio')
  }

  return await actualizarEstadoLoteExtractoRepo(extractoId, estadoLote.trim())
}

export const actualizarStockActualExtractoService = async (id, stockActual) => {
  const extractoId = Number(id)

  if (!Number.isInteger(extractoId) || extractoId <= 0) {
    throw new Error('id debe ser un entero positivo')
  }

  const extracto = await obtenerExtractoPorIdRepo(extractoId)

  if (!extracto) {
    throw new Error('Extracto no encontrado')
  }

  if (stockActual == null || stockActual === '') {
    throw new Error('stock_actual es obligatorio')
  }

  const nuevoStockActual = Number(stockActual)

  if (Number.isNaN(nuevoStockActual)) {
    throw new Error('stock_actual debe ser numérico')
  }

  if (nuevoStockActual < 0) {
    throw new Error('stock_actual no puede ser negativo')
  }

  const stockInicial = Number(extracto.stock_inicial)

  if (nuevoStockActual > stockInicial) {
    throw new Error('stock_actual no puede ser mayor que stock_inicial')
  }

  return await actualizarStockActualExtractoRepo(extractoId, nuevoStockActual)
}
