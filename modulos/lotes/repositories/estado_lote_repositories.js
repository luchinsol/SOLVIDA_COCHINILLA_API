import db from '../../../config/database.js'

export const listarEstadosLoteRepo = async (filters = {}) => {
  const values = []
  const conditions = []

  if (filters.contexto === 'laboratorio') {
    conditions.push('estado_lote_id IN (2, 3, 6)')
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return await db.any(
    `SELECT
       estado_lote_id::int AS estado_lote_id,
       nombre,
       descripcion
     FROM lotes.estado_lote
     ${whereClause}
     ORDER BY estado_lote_id ASC`,
    values
  )
}
