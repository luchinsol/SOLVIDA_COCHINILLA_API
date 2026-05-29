import { listarEstadosLoteRepo } from '../repositories/estado_lote_repositories.js'

export const listarEstadosLoteService = async (filters = {}) => {
  const parsedFilters = {}

  if (filters.contexto !== undefined && filters.contexto !== '') {
    const contexto = String(filters.contexto).trim().toLowerCase()

    if (!['laboratorio'].includes(contexto)) {
      throw new Error('contexto no es válido')
    }

    parsedFilters.contexto = contexto
  }

  return await listarEstadosLoteRepo(parsedFilters)
}
