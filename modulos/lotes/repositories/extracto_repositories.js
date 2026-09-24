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
       estado_lote_id,
       observaciones,
       creado_en,
       modificado_en,
       unidad_medida_dinero
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW(), $14)
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
      data.estado_lote_id,
      data.observaciones ?? null,
      data.unidad_medida_dinero
    ]
  )
}

export const listarExtractosRepo = async (filters = {}) => {
  const conditions = []
  const values = []

  if (!filters.incluir_agotados) {
    conditions.push('sia.stock_actual > 0')
  }

  if (filters.tipo_extracto !== undefined) {
    values.push(filters.tipo_extracto)
    conditions.push(`LOWER(e.tipo_extracto) = LOWER($${values.length})`)
  }

  if (filters.estado_lote !== undefined) {
    values.push(filters.estado_lote)
    conditions.push(`LOWER(el.nombre) = LOWER($${values.length})`)
  }

  if (filters.almacen_id !== undefined) {
    values.push(filters.almacen_id)
    conditions.push(`sia.almacen_id = $${values.length}`)
  }

  if (filters.proceso_filtrado_id !== undefined) {
    values.push(filters.proceso_filtrado_id)
    conditions.push(`e.proceso_filtrado_id = $${values.length}`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  return await db.any(
    `SELECT
       e.*,
       sia.almacen_id::int AS almacen_id,
       sia.stock_actual::double precision AS stock_actual,
       COALESCE(stock_total.stock_total, 0)::double precision AS stock_total,
       COALESCE(stock_total.cantidad_almacenes, 0)::int AS cantidad_almacenes,
       (sia.stock_actual * COALESCE(e.costo_unitario, 0))::double precision
         AS costo_total_actual,
       e.costo_unitario::double precision AS costo_por_unidad,
       a.nombre AS almacen_nombre,
       el.nombre AS estado_lote,
       pf.codigo_proceso AS proceso_filtrado_codigo
     FROM lotes.extracto e
     INNER JOIN inventario.stock_item_almacen sia
       ON e.item_inventario_id = sia.item_inventario_id
     LEFT JOIN LATERAL (
       SELECT
         SUM(sia_total.stock_actual) AS stock_total,
         COUNT(*) FILTER (WHERE sia_total.stock_actual > 0) AS cantidad_almacenes
       FROM inventario.stock_item_almacen sia_total
       WHERE sia_total.item_inventario_id = e.item_inventario_id
     ) stock_total ON TRUE
     INNER JOIN inventario.almacen a
       ON sia.almacen_id = a.almacen_id
     LEFT JOIN lotes.estado_lote el
       ON e.estado_lote_id = el.estado_lote_id
     LEFT JOIN produccion.proceso_filtrado pf
       ON e.proceso_filtrado_id = pf.proceso_filtrado_id
     ${whereClause}
     ORDER BY e.extracto_id DESC, sia.almacen_id ASC`,
    values
  )
}

export const obtenerExtractoPorIdRepo = async (id, t = db) => {
  return await t.oneOrNone(
    `SELECT *
     FROM lotes.extracto
     WHERE extracto_id = $1`,
    [id]
  )
}

export const obtenerResumenExtractosRepo = async () => {
  return await db.one(
    `SELECT
       COALESCE(SUM(sia.stock_actual), 0) AS stock_actual,
       COALESCE(SUM(sia.stock_actual * COALESCE(e.costo_unitario, 0)), 0) AS costo_total,
       MAX(e.unidad_medida_stock) AS unidad_medida_cantidad,
       MAX(e.unidad_medida_dinero) AS unidad_medida_moneda,
       CASE
         WHEN COALESCE(SUM(sia.stock_actual), 0) = 0 THEN 0
         ELSE COALESCE(SUM(sia.stock_actual * COALESCE(e.costo_unitario, 0)), 0)
              / SUM(sia.stock_actual)
       END AS costo_unitario
     FROM lotes.extracto e
     INNER JOIN inventario.stock_item_almacen sia
       ON e.item_inventario_id = sia.item_inventario_id`
  )
}

export const actualizarEstadoLoteExtractoRepo = async (id, estadoLoteId, t = db) => {
  return await t.oneOrNone(
    `UPDATE lotes.extracto
     SET
       estado_lote_id = $1,
       modificado_en = NOW()
     WHERE extracto_id = $2
     RETURNING *`,
    [estadoLoteId, id]
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
