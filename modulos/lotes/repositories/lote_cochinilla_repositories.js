import db from '../../../config/database.js'

/* ======================================================
   CREATE: lote de cochinilla por compra
   proveedor_id y fecha_compra sí aplican
   tipo_lote = 'comprado'
====================================================== */
export const crearLoteCochinillaPorCompraRepo = async (data, t = db) => {
  const result = await t.one(
    `INSERT INTO lotes.lote_cochinilla
    (
      item_inventario_id,
      almacen_id,
      proveedor_id,
      analisis_actual_id,
      creado_por,
      codigo_lote,
      tipo_lote,
      fecha_creacion,
      calidad_cochinilla,
      stock_actual,
      costo_unitario,
      concentracion_ac_actual,
      humedad_actual,
      estado_lote_id,
      observaciones
      ,
      creado_en,
      modificado_en,
      costo_total_inicial,
      costo_total_actual,
      costo_puntoac_dolares,
      stock_inicial,
      unidad_medida_stock,
      unidad_medida_dinero
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW(), $16, $17, $18, $19, $20, $21)
    RETURNING *`,
    [
      data.item_inventario_id,
      data.almacen_id,
      data.proveedor_id,
      data.analisis_actual_id ?? null,
      data.creado_por ?? null,
      data.codigo_lote,
      'comprado',
      data.fecha_creacion ?? null,
      data.calidad_cochinilla ?? null,
      data.stock_actual,
      data.costo_unitario,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.estado_lote_id ?? 2,
      data.observaciones ?? null,
      data.costo_total_inicial,
      data.costo_total_actual,
      data.costo_puntoac_dolares ?? null,
      data.stock_inicial,
      data.unidad_medida_stock ?? null,
      data.unidad_medida_dinero ?? null
    ]
  )

  return result
}

/* ======================================================
   CREATE: lote de cochinilla por mezcla / preparado
   no requiere proveedor_id ni fecha_compra
   tipo_lote = 'preparado'
====================================================== */
export const crearLoteCochinillaPorMezclaRepo = async (data, t = db) => {
  const result = await t.one(
    `INSERT INTO lotes.lote_cochinilla
    (
      item_inventario_id,
      almacen_id,
      analisis_actual_id,
      creado_por,
      codigo_lote,
      tipo_lote,
      fecha_creacion,
      calidad_cochinilla,
      stock_actual,
      costo_unitario,
      concentracion_ac_actual,
      humedad_actual,
      estado_lote_id,
      observaciones,
      creado_en,
      modificado_en,
      costo_total_inicial,
      costo_total_actual,
      costo_puntoac_dolares,
      stock_inicial,
      unidad_medida_stock,
      unidad_medida_dinero
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NOW(), $15, $16, $17, $18, $19, $20)
    RETURNING *`,
    [
      data.item_inventario_id,
      data.almacen_id,
      data.analisis_actual_id ?? null,
      data.creado_por ?? null,
      data.codigo_lote,
      'preparado',
      data.fecha_creacion ?? new Date(),
      data.calidad_cochinilla ?? null,
      data.stock_actual ?? 0,
      data.costo_unitario ?? 0,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.estado_lote_id ?? 2,
      data.observaciones ?? null,
      data.costo_total_inicial ?? 0,
      data.costo_total_actual ?? 0,
      data.costo_puntoac_dolares ?? null,
      data.stock_inicial ?? 0,
      data.unidad_medida_stock ?? null,
      data.unidad_medida_dinero ?? null
    ]
  )

  return result
}
/* ======================================================
   READ: listar todos los lotes de cochinilla
====================================================== */
export const listarLotesCochinillaRepo = async (filters = {}) => {
  const conditions = []
  const values = []

  if (filters.almacen_id !== undefined) {
    values.push(filters.almacen_id)
    conditions.push(`lc.almacen_id = $${values.length}`)
  }

  if (filters.proveedor_id !== undefined) {
    values.push(filters.proveedor_id)
    conditions.push(`lc.proveedor_id = $${values.length}`)
  }

  if (filters.calidad_cochinilla !== undefined) {
    values.push(filters.calidad_cochinilla)
    conditions.push(`LOWER(lc.calidad_cochinilla) = LOWER($${values.length})`)
  }

  if (filters.tipo_lote !== undefined) {
    values.push(filters.tipo_lote)
    conditions.push(`LOWER(lc.tipo_lote) = LOWER($${values.length})`)
  }

  if (filters.estado_lote !== undefined) {
    values.push(filters.estado_lote)
    conditions.push(`LOWER(lc.estado_lote) = LOWER($${values.length})`)
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const result = await db.any(
    `SELECT
       lc.*,
       p.nombre_razon_social AS proveedor_nombre,
       a.nombre AS almacen_nombre
     FROM lotes.lote_cochinilla lc
     LEFT JOIN inventario.proveedor p
       ON lc.proveedor_id = p.proveedor_id
     LEFT JOIN inventario.almacen a
       ON lc.almacen_id = a.almacen_id
     ${whereClause}
     ORDER BY lc.lote_cochinilla_id DESC`,
    values
  )

  return result
}

/* ======================================================
   READ: obtener lote de cochinilla por id
====================================================== */
export const obtenerLoteCochinillaPorIdRepo = async (id, t = db) => {
  const result = await t.oneOrNone(
    `SELECT
       lc.*,
       p.nombre_razon_social AS proveedor_nombre,
       a.nombre AS almacen_nombre
     FROM lotes.lote_cochinilla lc
     LEFT JOIN inventario.proveedor p
       ON lc.proveedor_id = p.proveedor_id
     LEFT JOIN inventario.almacen a
       ON lc.almacen_id = a.almacen_id
     WHERE lc.lote_cochinilla_id = $1`,
    [id]
  )

  return result
}

export const obtenerResumenLotesCochinillaRepo = async () => {
  return await db.one(
    `SELECT
       COALESCE(SUM(lc.stock_actual), 0) AS stock_actual,
       COALESCE(SUM(lc.costo_total_actual), 0) AS costo_total,
       MAX(lc.unidad_medida_stock) AS unidad_medida_cantidad,
       MAX(lc.unidad_medida_dinero) AS unidad_medida_moneda,
       CASE
         WHEN COALESCE(SUM(lc.stock_actual), 0) = 0 THEN 0
         ELSE COALESCE(SUM(lc.costo_total_actual), 0) / SUM(lc.stock_actual)
       END AS costo_unitario
     FROM lotes.lote_cochinilla lc`
  )
}

/* ======================================================
   UPDATE: actualizar lote de cochinilla
====================================================== */
export const actualizarAnalisisLoteCochinillaRepo = async (id, data, t = db) => {
  const result = await t.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET
       analisis_actual_id = $1,
       concentracion_ac_actual = $2,
       humedad_actual = $3,
       costo_puntoac_dolares = $4,
       estado_lote = $5,
       modificado_en = NOW()
     WHERE lote_cochinilla_id = $6
     RETURNING *`,
    [
      data.analisis_actual_id ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.costo_puntoac_dolares ?? null,
      data.estado_lote,
      id
    ]
  )

  return result
}

export const actualizarEstadoLoteCochinillaRepo = async (id, estadoLoteId, t = db) => {
  const result = await t.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET
       estado_lote_id = $1,
       modificado_en = NOW()
     WHERE lote_cochinilla_id = $2
     RETURNING *`,
    [estadoLoteId, id]
  )

  return result
}

export const actualizarStockActualLoteCochinillaRepo = async (id, stockActual, t = db) => {
  const result = await t.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET
       stock_actual = $1,
       modificado_en = NOW()
     WHERE lote_cochinilla_id = $2
     RETURNING *`,
    [stockActual, id]
  )

  return result
}

export const actualizarConsumoLoteCochinillaRepo = async (id, data, t = db) => {
  const stockActual = data.stock_actual ?? data.masa_total_kg

  const estadoLoteIdMap = {
    disponible: 1,
    'por analizar': 2,
    bloqueado: 3,
    agotado: 4,
    'por moler': 5,
    'en analisis': 6,
    usado: 1
  }

  const estadoLoteId =
    data.estado_lote_id ??
    (typeof data.estado === 'string'
      ? estadoLoteIdMap[data.estado.toLowerCase()] ?? null
      : data.estado ?? null)

  const result = await t.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET
       stock_actual = $1,
       estado_lote_id = $2,
       modificado_en = NOW()
     WHERE lote_cochinilla_id = $3
     RETURNING *`,
    [
      stockActual,
      estadoLoteId,
      id
    ]
  )

  return result
}


/* ======================================================
   UPDATE: actualizar masa de lote de cochinilla preparado
   por delta, es decir suma o resta a la masa actual.
   si delta es +10, aumenta 10kg. si delta es -5, reduce 5kg.
====================================================== */
export const actualizarMasaLoteCochinillaPorDeltaRepo = async (id, delta, t = db) => {
  const result = await t.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET masa_total_kg = masa_total_kg + $1
     WHERE lote_cochinilla_id = $2
     RETURNING *`,
    [delta, id]
  )

  return result
}

/* ======================================================
   UPDATE: actualizar masa y costos de lote de cochinilla
====================================================== */
export const actualizarCostosYMasaLoteCochinillaRepo = async (id, data, t = db) => {
  const result = await t.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET
       masa_total_kg = $1,
       costo_total_dolares = $2,
       costo_kilo_dolares = $3
     WHERE lote_cochinilla_id = $4
     RETURNING *`,
    [
      data.masa_total_kg,
      data.costo_total_dolares,
      data.costo_kilo_dolares,
      id
    ]
  )

  return result
}

/* ======================================================
   DELETE: eliminar lote de cochinilla 
====================================================== */
export const eliminarLoteCochinillaRepo = async (id, t = db) => {
  const result = await t.oneOrNone(
    `DELETE FROM lotes.lote_cochinilla
     WHERE lote_cochinilla_id = $1
     RETURNING *`,
    [id]
  )

  return result
}
