import { listarExtractosRepo } from '../repositories/extracto_repositories.js'

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
