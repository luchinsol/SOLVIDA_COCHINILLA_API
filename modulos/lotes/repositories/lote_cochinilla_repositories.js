import db from '../../../config/database.js'

/* ======================================================
   CREATE: crear lote de cochinilla
====================================================== */
export const crearLoteCochinillaRepo = async (data) => {
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
      concentracion_ac_actual,
      humedad_actual,
      estado,
      observaciones
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *`,
    [
      data.proveedor_id ?? null,
      data.analisis_actual_id ?? null,
      data.creado_por ?? null,
      data.codigo_lote ?? null,
      data.tipo_lote,
      data.fecha_compra ?? null,
      data.fecha_creacion ?? null,
      data.calidad ?? null,
      data.masa_total_kg,
      data.concentracion_ac_actual ?? null,
      data.humedad_actual ?? null,
      data.estado ?? 'disponible',
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
export const actualizarAnalisisLoteCochinillaRepo = async (id, data) => {
  const result = await db.oneOrNone(
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

export const actualizarConsumoLoteCochinillaRepo = async (id, data) => {
  const result = await db.oneOrNone(
    `UPDATE lotes.lote_cochinilla
     SET
       masa_total_kg = $1,
       estado = $2
     WHERE lote_cochinilla_id = $3
     RETURNING *`,
    [
      data.masa_total_kg,
      data.estado, // 'usado' o 'agotado'
      id
    ]
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