import db from '../../../config/database.js'

// CREATE: lote de carmín creado desde proceso de laqueo
export const crearLoteCarminDesdeLaqueoRepo = async (data) => {
  const result = await db.one(
    `INSERT INTO lotes.lote_carmin
    (
      proceso_laqueo_id,
      codigo_lote,
      tipo_lote,
      masa_total_kg,
      concentracion_ac_actual,
      humedad_actual,
      color_l_actual,
      color_a_actual,
      color_b_actual,
      observaciones,
      calidad_lote,
      estado_lote
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      data.proceso_laqueo_id,
      data.codigo_lote,
      data.tipo_lote,
      data.masa_total_kg ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.color_l_actual ?? null,
      data.color_a_actual ?? null,
      data.color_b_actual ?? null,
      data.observaciones ?? null,
      data.calidad_lote ?? null,
      data.estado_lote ?? 'por_moler'
    ]
  )

  return result
}

// CREATE: lote de carmín creado desde proceso de molienda
export const crearLoteCarminDesdeMoliendaRepo = async (data) => {
  const result = await db.one(
    `INSERT INTO lotes.lote_carmin
    (
      proceso_molienda_id,
      codigo_lote,
      tipo_lote,
      masa_total_kg,
      concentracion_ac_actual,
      humedad_actual,
      color_l_actual,
      color_a_actual,
      color_b_actual,
      observaciones,
      calidad_lote,
      estado_lote
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      data.proceso_molienda_id,
      data.codigo_lote ?? null,
      data.tipo_lote,
      data.masa_total_kg ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.color_l_actual ?? null,
      data.color_a_actual ?? null,
      data.color_b_actual ?? null,
      data.observaciones ?? null,
      data.calidad_lote ?? null,
      data.estado_lote ?? 'por_analizar'
    ]
  )

  return result
}

// CREATE: lote de carmín creado desde proceso de mezclado
export const crearLoteCarminDesdeMezcladoRepo = async (data) => {
  const result = await db.one(
    `INSERT INTO lotes.lote_carmin
    (
      proceso_mezclado_id,
      codigo_lote,
      tipo_lote,
      masa_total_kg,
      concentracion_ac_actual,
      humedad_actual,
      color_l_actual,
      color_a_actual,
      color_b_actual,
      observaciones,
      calidad_lote,
      estado_lote
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *`,
    [
      data.proceso_mezclado_id,
      data.codigo_lote ?? null,
      data.tipo_lote,
      data.masa_total_kg ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.color_l_actual ?? null,
      data.color_a_actual ?? null,
      data.color_b_actual ?? null,
      data.observaciones ?? null,
      data.calidad_lote ?? null,
      data.estado_lote ?? 'por_analizar'
    ]
  )

  return result
}

// READ: listar todos los lotes de carmín
export const listarLotesCarminRepo = async () => {
  const result = await db.any(
    `SELECT *
     FROM lotes.lote_carmin
     ORDER BY lote_carmin_id DESC`
  )
  return result
}

// READ: obtener lote de carmín por id
export const obtenerLoteCarminPorIdRepo = async (id) => {
  const result = await db.oneOrNone(
    `SELECT *
     FROM lotes.lote_carmin
     WHERE lote_carmin_id = $1`,
    [id]
  )
  return result
}

// READ: búsqueda dinámica de lotes de carmín con múltiples filtros
export const buscarLotesCarminConFiltrosRepo = async (filtros) => {
  let query = `
    SELECT *
    FROM lotes.lote_carmin
    WHERE 1 = 1
  `

  const values = []
  let index = 1

  if (filtros.tipo_lote?.trim()) {
    query += ` AND tipo_lote = $${index}`
    values.push(filtros.tipo_lote.trim())
    index++
  }

  if (filtros.calidad_lote?.trim()) {
    query += ` AND calidad_lote = $${index}`
    values.push(filtros.calidad_lote.trim())
    index++
  }

  if (filtros.concentracion_min != null) {
    query += ` AND concentracion_ac_actual >= $${index}`
    values.push(filtros.concentracion_min)
    index++
  }

  if (filtros.concentracion_max != null) {
    query += ` AND concentracion_ac_actual <= $${index}`
    values.push(filtros.concentracion_max)
    index++
  }

  if (filtros.masa_min != null) {
    query += ` AND masa_total_kg >= $${index}`
    values.push(filtros.masa_min)
    index++
  }

  if (filtros.masa_max != null) {
    query += ` AND masa_total_kg <= $${index}`
    values.push(filtros.masa_max)
    index++
  }

  if (filtros.color_l_min != null) {
    query += ` AND color_l_actual >= $${index}`
    values.push(filtros.color_l_min)
    index++
  }

  if (filtros.color_l_max != null) {
    query += ` AND color_l_actual <= $${index}`
    values.push(filtros.color_l_max)
    index++
  }

  if (filtros.color_a_min != null) {
    query += ` AND color_a_actual >= $${index}`
    values.push(filtros.color_a_min)
    index++
  }

  if (filtros.color_a_max != null) {
    query += ` AND color_a_actual <= $${index}`
    values.push(filtros.color_a_max)
    index++
  }

  if (filtros.color_b_min != null) {
    query += ` AND color_b_actual >= $${index}`
    values.push(filtros.color_b_min)
    index++
  }

  if (filtros.color_b_max != null) {
    query += ` AND color_b_actual <= $${index}`
    values.push(filtros.color_b_max)
    index++
  }

  query += ` ORDER BY lote_carmin_id DESC`

  const result = await db.any(query, values)
  return result
}

// READ: listar lotes de carmín sin análisis de laboratorio
export const listarLotesCarminSinAnalisisRepo = async () => {
  const result = await db.any(
    `SELECT *
     FROM lotes.lote_carmin
     WHERE analisis_actual_id IS NULL
     ORDER BY lote_carmin_id DESC`
  )
  return result
}

// READ: obtener lotes por proceso de laqueo
export const obtenerLotesCarminPorProcesoLaqueoRepo = async (procesoLaqueoId) => {
  const result = await db.any(
    `SELECT *
     FROM lotes.lote_carmin
     WHERE proceso_laqueo_id = $1
     ORDER BY lote_carmin_id DESC`,
    [procesoLaqueoId]
  )
  return result
}

// READ: obtener lotes por proceso de molienda
export const obtenerLotesCarminPorProcesoMoliendaRepo = async (procesoMoliendaId) => {
  const result = await db.any(
    `SELECT *
     FROM lotes.lote_carmin
     WHERE proceso_molienda_id = $1
     ORDER BY lote_carmin_id DESC`,
    [procesoMoliendaId]
  )
  return result
}

// READ: obtener lotes por proceso de mezclado
export const obtenerLotesCarminPorProcesoMezcladoRepo = async (procesoMezcladoId) => {
  const result = await db.any(
    `SELECT *
     FROM lotes.lote_carmin
     WHERE proceso_mezclado_id = $1
     ORDER BY lote_carmin_id DESC`,
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
       codigo_lote = $2,
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
      data.codigo_lote ?? null,
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