import db from '../../../config/database.js'

/* ======================================================
   CREATE: lote de cochinilla por compra
   proveedor_id y fecha_compra sí aplican
   tipo_lote = 'comprado'
====================================================== */
export const crearLoteCochinillaPorCompraRepo = async (data) => {
  const result = await db.one(
    `INSERT INTO lotes.lote_cochinilla
    (
      proveedor_id,
      analisis_actual_id,
      creado_por,
      codigo_lote,
      tipo_lote,
      fecha_compra,
      fecha_creacion,
      calidad,
      masa_total_kg,
      costo_total_dolares,
      costo_kilo_dolares,
      concentracion_ac_actual,
      humedad_actual,
      estado,
      observaciones
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      data.proveedor_id,
      data.analisis_actual_id ?? null,
      data.creado_por ?? null,
      data.codigo_lote,
      'comprado',
      data.fecha_compra,
      data.fecha_creacion ?? null,
      data.calidad ?? null,
      data.masa_total_kg,
      data.costo_total_dolares,
      data.costo_kilo_dolares,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.estado ?? 'por analizar',
      data.observaciones ?? null
    ]
  )

  return result
}

/* ======================================================
   CREATE: lote de cochinilla por mezcla / preparado
   no requiere proveedor_id ni fecha_compra
   tipo_lote = 'preparado'
====================================================== */
export const crearLoteCochinillaPorMezclaRepo = async (data) => {
  const result = await db.one(
    `INSERT INTO lotes.lote_cochinilla
    (
      proveedor_id,
      analisis_actual_id,
      creado_por,
      codigo_lote,
      tipo_lote,
      fecha_compra,
      fecha_creacion,
      calidad,
      masa_total_kg,
      costo_total_dolares,
      costo_kilo_dolares,
      concentracion_ac_actual,
      humedad_actual,
      estado,
      observaciones
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *`,
    [
      null,
      data.analisis_actual_id ?? null,
      data.creado_por ?? null,
      data.codigo_lote,
      'preparado',
      null,
      data.fecha_creacion ?? new Date(),
      data.calidad ?? null,
      0,
      0,
      0,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.estado ?? 'por analizar',
      data.observaciones ?? null
    ]
  )

  return result
}
/* ======================================================
   READ: listar todos los lotes de cochinilla
====================================================== */
export const listarLotesCochinillaRepo = async () => {
  const result = await db.any(
    `SELECT *
     FROM lotes.lote_cochinilla
     ORDER BY lote_cochinilla_id DESC`
  )

  return result
}

/* ======================================================
   READ: obtener lote de cochinilla por id
====================================================== */
export const obtenerLoteCochinillaPorIdRepo = async (id) => {
  const result = await db.oneOrNone(
    `SELECT *
     FROM lotes.lote_cochinilla
     WHERE lote_cochinilla_id = $1`,
    [id]
  )

  return result
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
       humedad_actual = $3
     WHERE lote_cochinilla_id = $4
     RETURNING *`,
    [
      data.analisis_actual_id ?? null,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      id
    ]
  )

  return result
}

export const actualizarConsumoLoteCochinillaRepo = async (id, data, t = db) => {
  const result = await t.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET
       masa_total_kg = $1,
       estado = $2
     WHERE lote_cochinilla_id = $3
     RETURNING *`,
    [
      data.masa_total_kg,
      data.estado,
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
   DELETE: eliminar lote de cochinilla
====================================================== */
export const eliminarLoteCochinillaRepo = async (id) => {
  const result = await db.oneOrNone(
    `DELETE FROM lotes.lote_cochinilla
     WHERE lote_cochinilla_id = $1
     RETURNING *`,
    [id]
  )

  return result
}