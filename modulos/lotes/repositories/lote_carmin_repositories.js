import db from '../../../config/database.js'

const loteCarminSelect = `
  SELECT
    lc.*,
    a.nombre AS almacen_nombre,
    pl.nombre_proceso AS proceso_laqueo_nombre,
    pm.nombre_proceso AS proceso_molienda_nombre,
    pz.nombre_proceso AS proceso_mezclado_nombre
  FROM lotes.lote_carmin lc
  LEFT JOIN inventario.almacen a
    ON lc.almacen_id = a.almacen_id
  LEFT JOIN produccion.proceso_laqueo pl
    ON lc.proceso_laqueo_id = pl.proceso_laqueo_id
  LEFT JOIN produccion.proceso_molienda pm
    ON lc.proceso_molienda_id = pm.proceso_molienda_id
  LEFT JOIN produccion.proceso_mezclado pz
    ON lc.proceso_mezclado_id = pz.proceso_mezclado_id
`

// CREATE: lote de carmín creado desde proceso de laqueo
export const crearLoteCarminDesdeLaqueoRepo = async (data, t = db) => {
  const result = await t.one(
    `INSERT INTO lotes.lote_carmin
    (
      item_inventario_id,
      almacen_id,
      proceso_laqueo_id,
      nombre_lote,
      tipo_lote,
      stock_inicial,
      stock_actual,
      concentracion_ac_actual,
      humedad_actual,
      color_l_actual,
      color_a_actual,
      color_b_actual,
      observaciones,
      unidad_medida_stock,
      calidad_lote,
      estado_lote
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      data.item_inventario_id,
      data.almacen_id,
      data.proceso_laqueo_id,
      data.nombre_lote,
      data.tipo_lote,
      data.stock_inicial ?? null,
      data.stock_actual ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.color_l_actual ?? null,
      data.color_a_actual ?? null,
      data.color_b_actual ?? null,
      data.observaciones ?? null,
      data.unidad_medida_stock ?? 'kg',
      data.calidad_lote ?? null,
      data.estado_lote ?? 'por_moler'
    ]
  )

  return result
}

// CREATE: lote de carmín creado desde proceso de molienda
export const crearLoteCarminDesdeMoliendaRepo = async (data, t = db) => {
  const result = await t.one(
    `INSERT INTO lotes.lote_carmin
    (
      item_inventario_id,
      almacen_id,
      proceso_molienda_id,
      nombre_lote,
      tipo_lote,
      stock_inicial,
      stock_actual,
      concentracion_ac_actual,
      humedad_actual,
      color_l_actual,
      color_a_actual,
      color_b_actual,
      observaciones,
      unidad_medida_stock,
      calidad_lote,
      estado_lote
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      data.item_inventario_id,
      data.almacen_id,
      data.proceso_molienda_id,
      data.nombre_lote ?? null,
      data.tipo_lote,
      data.stock_inicial ?? null,
      data.stock_actual ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.color_l_actual ?? null,
      data.color_a_actual ?? null,
      data.color_b_actual ?? null,
      data.observaciones ?? null,
      data.unidad_medida_stock ?? 'kg',
      data.calidad_lote ?? null,
      data.estado_lote ?? 'por_analizar'
    ]
  )

  return result
}

// CREATE: lote de carmín creado desde proceso de mezclado
export const crearLoteCarminDesdeMezcladoRepo = async (data, t = db) => {
  const result = await t.one(
    `INSERT INTO lotes.lote_carmin
    (
      item_inventario_id,
      almacen_id,
      proceso_mezclado_id,
      nombre_lote,
      tipo_lote,
      stock_inicial,
      stock_actual,
      concentracion_ac_actual,
      humedad_actual,
      color_l_actual,
      color_a_actual,
      color_b_actual,
      observaciones,
      unidad_medida_stock,
      calidad_lote,
      estado_lote
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
    RETURNING *`,
    [
      data.item_inventario_id,
      data.almacen_id,
      data.proceso_mezclado_id,
      data.nombre_lote ?? null,
      data.tipo_lote,
      data.stock_inicial ?? null,
      data.stock_actual ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.color_l_actual ?? null,
      data.color_a_actual ?? null,
      data.color_b_actual ?? null,
      data.observaciones ?? null,
      data.unidad_medida_stock ?? 'kg',
      data.calidad_lote ?? null,
      data.estado_lote ?? 'por_analizar'
    ]
  )

  return result
}

// READ: listar todos los lotes de carmín
export const listarLotesCarminRepo = async () => {
  const result = await db.any(
    `${loteCarminSelect}
     ORDER BY lc.lote_carmin_id DESC`
  )
  return result
}

// READ: obtener lote de carmín por id
export const obtenerLoteCarminPorIdRepo = async (id) => {
  const result = await db.oneOrNone(
    `${loteCarminSelect}
     WHERE lc.lote_carmin_id = $1`,
    [id]
  )
  return result
}

// READ: búsqueda dinámica de lotes de carmín con múltiples filtros
export const obtenerResumenLotesCarminRepo = async () => {
  return await db.one(
    `SELECT
       COALESCE(SUM(lc.stock_actual), 0) AS stock_actual,
       NULL::numeric AS costo_total,
       MAX(lc.unidad_medida_stock) AS unidad_medida_cantidad,
       NULL::text AS unidad_medida_moneda,
       NULL::numeric AS costo_unitario
     FROM lotes.lote_carmin lc`
  )
}

export const buscarLotesCarminConFiltrosRepo = async (filtros) => {
  let query = `
    ${loteCarminSelect}
    WHERE 1 = 1
  `

  const values = []
  let index = 1

  if (filtros.tipo_lote?.trim()) {
    query += ` AND lc.tipo_lote = $${index}`
    values.push(filtros.tipo_lote.trim())
    index++
  }

  if (filtros.calidad_lote?.trim()) {
    query += ` AND lc.calidad_lote = $${index}`
    values.push(filtros.calidad_lote.trim())
    index++
  }

  if (filtros.estado_lote?.trim()) {
    query += ` AND lc.estado_lote = $${index}`
    values.push(filtros.estado_lote.trim())
    index++
  }

  if (filtros.almacen_id != null) {
    query += ` AND lc.almacen_id = $${index}`
    values.push(filtros.almacen_id)
    index++
  }

  if (filtros.proceso_laqueo_id != null) {
    query += ` AND lc.proceso_laqueo_id = $${index}`
    values.push(filtros.proceso_laqueo_id)
    index++
  }

  if (filtros.proceso_molienda_id != null) {
    query += ` AND lc.proceso_molienda_id = $${index}`
    values.push(filtros.proceso_molienda_id)
    index++
  }

  if (filtros.proceso_mezclado_id != null) {
    query += ` AND lc.proceso_mezclado_id = $${index}`
    values.push(filtros.proceso_mezclado_id)
    index++
  }

  if (filtros.concentracion_min != null) {
    query += ` AND lc.concentracion_ac_actual >= $${index}`
    values.push(filtros.concentracion_min)
    index++
  }

  if (filtros.concentracion_max != null) {
    query += ` AND lc.concentracion_ac_actual <= $${index}`
    values.push(filtros.concentracion_max)
    index++
  }

  if (filtros.stock_actual_min != null) {
    query += ` AND lc.stock_actual >= $${index}`
    values.push(filtros.stock_actual_min)
    index++
  }

  if (filtros.stock_actual_max != null) {
    query += ` AND lc.stock_actual <= $${index}`
    values.push(filtros.stock_actual_max)
    index++
  }

  if (filtros.stock_inicial_min != null) {
    query += ` AND lc.stock_inicial >= $${index}`
    values.push(filtros.stock_inicial_min)
    index++
  }

  if (filtros.stock_inicial_max != null) {
    query += ` AND lc.stock_inicial <= $${index}`
    values.push(filtros.stock_inicial_max)
    index++
  }

  if (filtros.color_l_min != null) {
    query += ` AND lc.color_l_actual >= $${index}`
    values.push(filtros.color_l_min)
    index++
  }

  if (filtros.color_l_max != null) {
    query += ` AND lc.color_l_actual <= $${index}`
    values.push(filtros.color_l_max)
    index++
  }

  if (filtros.color_a_min != null) {
    query += ` AND lc.color_a_actual >= $${index}`
    values.push(filtros.color_a_min)
    index++
  }

  if (filtros.color_a_max != null) {
    query += ` AND lc.color_a_actual <= $${index}`
    values.push(filtros.color_a_max)
    index++
  }

  if (filtros.color_b_min != null) {
    query += ` AND lc.color_b_actual >= $${index}`
    values.push(filtros.color_b_min)
    index++
  }

  if (filtros.color_b_max != null) {
    query += ` AND lc.color_b_actual <= $${index}`
    values.push(filtros.color_b_max)
    index++
  }

  query += ` ORDER BY lc.lote_carmin_id DESC`

  const result = await db.any(query, values)
  return result
}

// READ: listar lotes de carmín sin análisis de laboratorio
export const listarLotesCarminSinAnalisisRepo = async () => {
  const result = await db.any(
    `${loteCarminSelect}
     WHERE lc.analisis_actual_id IS NULL
     ORDER BY lc.lote_carmin_id DESC`
  )
  return result
}

// READ: obtener lotes por proceso de laqueo
export const obtenerLotesCarminPorProcesoLaqueoRepo = async (procesoLaqueoId) => {
  const result = await db.any(
    `${loteCarminSelect}
     WHERE lc.proceso_laqueo_id = $1
     ORDER BY lc.lote_carmin_id DESC`,
    [procesoLaqueoId]
  )
  return result
}

// READ: obtener lotes por proceso de molienda
export const obtenerLotesCarminPorProcesoMoliendaRepo = async (procesoMoliendaId) => {
  const result = await db.any(
    `${loteCarminSelect}
     WHERE lc.proceso_molienda_id = $1
     ORDER BY lc.lote_carmin_id DESC`,
    [procesoMoliendaId]
  )
  return result
}

// READ: obtener lotes por proceso de mezclado
export const obtenerLotesCarminPorProcesoMezcladoRepo = async (procesoMezcladoId) => {
  const result = await db.any(
    `${loteCarminSelect}
     WHERE lc.proceso_mezclado_id = $1
     ORDER BY lc.lote_carmin_id DESC`,
    [procesoMezcladoId]
  )
  return result
}

// UPDATE: actualizar resultados de análisis y completar código de lote
export const actualizarResultadosAnalisisLoteCarminRepo = async (id, data) => {
  const result = await db.oneOrNone(
    `UPDATE lotes.lote_carmin
     SET
       analisis_actual_id = $1,
       nombre_lote = $2,
       concentracion_ac_actual = $3,
       humedad_actual = $4,
       color_l_actual = $5,
       color_a_actual = $6,
       color_b_actual = $7,
       calidad_lote = $8,
       estado_lote = $9
     WHERE lote_carmin_id = $10
     RETURNING *`,
    [
      data.analisis_actual_id ?? null,
      data.nombre_lote ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.color_l_actual ?? null,
      data.color_a_actual ?? null,
      data.color_b_actual ?? null,
      data.calidad_lote ?? null,
      data.estado_lote ?? 'disponible',
      id
    ]
  )

  return result
}

// UPDATE: actualizar observaciones
export const actualizarObservacionesLoteCarminRepo = async (id, observaciones) => {
  const result = await db.oneOrNone(
    `UPDATE lotes.lote_carmin
     SET observaciones = $1
     WHERE lote_carmin_id = $2
     RETURNING *`,
    [
      observaciones ?? null,
      id
    ]
  )

  return result
}

// UPDATE: cambiar estado del lote a bloqueado en caso de problemas de calidad o para evitar su uso en producción
export const actualizarEstadoLoteCarminRepo = async (id, estadoLote) => {
  const result = await db.oneOrNone(
    `UPDATE lotes.lote_carmin
     SET estado_lote = $1
     WHERE lote_carmin_id = $2
     RETURNING *`,
    [
      estadoLote,
      id
    ]
  )

  return result
}

export const bloquearLoteCarminRepo = async (id) => {
  const result = await db.oneOrNone(
    `UPDATE lotes.lote_carmin
     SET estado_lote = 'bloqueado'
     WHERE lote_carmin_id = $1
     RETURNING *`,
    [id]
  )

  return result
}

/*
No se implementa DELETE físico para lote_carmin
porque los lotes forman parte de la trazabilidad del proceso productivo.
En caso de requerirse anulación o baja operativa, debe manejarse mediante el campo estado_lote.
*/
