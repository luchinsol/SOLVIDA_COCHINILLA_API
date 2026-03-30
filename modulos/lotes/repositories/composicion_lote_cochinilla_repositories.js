import db from '../../../config/database.js'

/* ======================================================
   READ: listar todas las composiciones de lotes de cochinilla
====================================================== */
export const listarComposicionesLoteCochinillaRepo = async (t = db) => {
  const result = await t.any(
    `SELECT *
     FROM lotes.composicion_lote_cochinilla
     ORDER BY composicion_lote_cochinilla_id DESC`
  )

  return result
}

/* ======================================================
   READ: obtener composición por id
====================================================== */
export const obtenerComposicionLoteCochinillaPorIdRepo = async (id, t = db) => {
  const result = await t.oneOrNone(
    `SELECT *
     FROM lotes.composicion_lote_cochinilla
     WHERE composicion_lote_cochinilla_id = $1`,
    [id]
  )

  return result
}

/* ======================================================
   READ: obtener composiciones por lote resultante
   sirve para ver de qué lotes viene un lote preparado
====================================================== */
export const obtenerComposicionesPorLoteResultanteRepo = async (loteResultanteId, t = db) => {
  const result = await t.any(
    `SELECT *
     FROM lotes.composicion_lote_cochinilla
     WHERE lote_resultante_id = $1
     ORDER BY composicion_lote_cochinilla_id ASC`,
    [loteResultanteId]
  )

  return result
}

/* ======================================================
   READ: obtener composiciones por lote componente
   sirve para ver en qué lotes resultantes se usó este lote
====================================================== */
export const obtenerComposicionesPorLoteComponenteRepo = async (loteComponenteId, t = db) => {
  const result = await t.any(
    `SELECT *
     FROM lotes.composicion_lote_cochinilla
     WHERE lote_componente_id = $1
     ORDER BY composicion_lote_cochinilla_id ASC`,
    [loteComponenteId]
  )

  return result
}

/* ======================================================
   CREATE: crear una composición de lote de cochinilla
====================================================== */
export const crearComposicionLoteCochinillaRepo = async (data, t = db) => {
  const result = await t.one(
    `INSERT INTO lotes.composicion_lote_cochinilla
    (
      lote_resultante_id,
      lote_componente_id,
      peso_utilizado_kg,
      porcentaje_participacion,
      observaciones
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *`,
    [
      data.lote_resultante_id,
      data.lote_componente_id,
      data.peso_utilizado_kg,
      data.porcentaje_participacion ?? null,
      data.observaciones ?? null
    ]
  )

  return result
}

/* ======================================================
   UPDATE: actualizar composición
   normalmente se ajusta peso, porcentaje y observaciones
====================================================== */
export const actualizarComposicionLoteCochinillaRepo = async (id, data, t = db) => {
  const result = await t.oneOrNone(
    `UPDATE lotes.composicion_lote_cochinilla
     SET
       peso_utilizado_kg = $1,
       porcentaje_participacion = $2,
       observaciones = $3
     WHERE composicion_lote_cochinilla_id = $4
     RETURNING *`,
    [
      data.peso_utilizado_kg,
      data.porcentaje_participacion ?? null,
      data.observaciones ?? null,
      id
    ]
  )

  return result
}

/* ======================================================
   UPDATE: recalcular porcentajes de participación
   para todos los componentes de un lote resultante
====================================================== */
export const actualizarPorcentajesPorLoteResultanteRepo = async (loteResultanteId, t = db) => {
  const result = await t.any(
    `UPDATE lotes.composicion_lote_cochinilla c
     SET porcentaje_participacion = sub.porcentaje
     FROM (
       SELECT
         composicion_lote_cochinilla_id,
         CASE
           WHEN SUM(peso_utilizado_kg) OVER (PARTITION BY lote_resultante_id) = 0 THEN 0
           ELSE ROUND(
             (peso_utilizado_kg / SUM(peso_utilizado_kg) OVER (PARTITION BY lote_resultante_id)) * 100,
             4
           )
         END AS porcentaje
       FROM lotes.composicion_lote_cochinilla
       WHERE lote_resultante_id = $1
     ) sub
     WHERE c.composicion_lote_cochinilla_id = sub.composicion_lote_cochinilla_id
     RETURNING c.*`,
    [loteResultanteId]
  )

  return result
}

/* ======================================================
   DELETE: eliminar composición
====================================================== */
export const eliminarComposicionLoteCochinillaRepo = async (id, t = db) => {
  const result = await t.oneOrNone(
    `DELETE FROM lotes.composicion_lote_cochinilla
     WHERE composicion_lote_cochinilla_id = $1
     RETURNING *`,
    [id]
  )

  return result
}
