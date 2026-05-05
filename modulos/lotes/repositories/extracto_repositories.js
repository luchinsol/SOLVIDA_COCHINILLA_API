import db from '../../../config/database.js'

export const listarExtractosRepo = async (filters = {}) => {
  const conditions = []
  const values = []

  if (filters.tipo_extracto !== undefined) {
    values.push(filters.tipo_extracto)
    conditions.push(`LOWER(e.tipo_extracto) = LOWER($${values.length})`)
  }

  if (filters.estado_lote !== undefined) {
    values.push(filters.estado_lote)
    conditions.push(`LOWER(e.estado_lote) = LOWER($${values.length})`)
  }

  if (filters.almacen_id !== undefined) {
    values.push(filters.almacen_id)
    conditions.push(`e.almacen_id = $${values.length}`)
  }

  if (filters.proceso_filtrado_id !== undefined) {
    values.push(filters.proceso_filtrado_id)
    conditions.push(`e.proceso_filtrado_id = $${values.length}`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return await db.any(
    `SELECT
       e.*,
       a.nombre AS almacen_nombre,
       pf.codigo_proceso AS proceso_filtrado_codigo
     FROM lotes.extracto e
     LEFT JOIN inventario.almacen a
       ON e.almacen_id = a.almacen_id
     LEFT JOIN produccion.proceso_filtrado pf
       ON e.proceso_filtrado_id = pf.proceso_filtrado_id
     ${whereClause}
     ORDER BY e.extracto_id DESC`,
    values
  )
}

export const obtenerExtractoPorIdRepo = async (id) => {
  return await db.oneOrNone(
    `SELECT *
     FROM lotes.extracto
     WHERE extracto_id = $1`,
    [id]
  )
}

export const actualizarEstadoLoteExtractoRepo = async (id, estadoLote) => {
  return await db.oneOrNone(
    `UPDATE lotes.extracto
     SET estado_lote = $1
     WHERE extracto_id = $2
     RETURNING *`,
    [estadoLote, id]
  )
}

export const actualizarStockActualExtractoRepo = async (id, stockActual) => {
  return await db.oneOrNone(
    `UPDATE lotes.extracto
     SET stock_actual = $1
     WHERE extracto_id = $2
     RETURNING *`,
    [stockActual, id]
  )
}
