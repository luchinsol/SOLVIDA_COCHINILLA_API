import db from '../../../config/database.js'

export const crearExtractoRepo = async (data, t = db) => {
  return await t.one(
    `INSERT INTO lotes.extracto
     (
       item_inventario_id,
       almacen_id,
       proceso_filtrado_id,
       nombre_extracto,
       tipo_extracto,
       stock_inicial,
       stock_actual,
       unidad_medida_stock,
       costo_total_inicial,
       costo_total_actual,
       costo_unitario,
       estado_lote,
       observaciones,
       unidad_medida_dinero
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [
      data.item_inventario_id,
      data.almacen_id,
      data.proceso_filtrado_id,
      data.nombre_extracto,
      data.tipo_extracto,
      data.stock_inicial,
      data.stock_actual,
      data.unidad_medida_stock ?? 'kg',
      data.costo_total_inicial ?? 0,
      data.costo_total_actual ?? data.costo_total_inicial ?? 0,
      data.costo_unitario ?? 0,
      data.estado_lote,
      data.observaciones ?? null,
      data.unidad_medida_dinero
    ]
  )
}

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

export const obtenerResumenExtractosRepo = async () => {
  return await db.one(
    `SELECT
       COALESCE(SUM(e.stock_actual), 0) AS stock_actual,
       COALESCE(SUM(e.costo_total_actual), 0) AS costo_total,
       MAX(e.unidad_medida_stock) AS unidad_medida_cantidad,
       MAX(e.unidad_medida_dinero) AS unidad_medida_moneda,
       CASE
         WHEN COALESCE(SUM(e.stock_actual), 0) = 0 THEN 0
         ELSE COALESCE(SUM(e.costo_total_actual), 0) / SUM(e.stock_actual)
       END AS costo_unitario
     FROM lotes.extracto e`
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
