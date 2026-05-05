import {
  actualizarEstadoLoteExtractoRepo,
  actualizarStockActualExtractoRepo,
  listarExtractosRepo,
  obtenerExtractoPorIdRepo
} from '../repositories/extracto_repositories.js'

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
