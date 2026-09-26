import db from '../../../config/database.js'

export const listarTiposCochinillaRepo = async (activo) => {
  if (activo === undefined) {
    return await db.query(
      `SELECT *
       FROM lotes.tipo_cochinilla
       ORDER BY tipo_cochinilla_id ASC`
    )
  }

  return await db.query(
    `SELECT *
     FROM lotes.tipo_cochinilla
     WHERE activo = $1
     ORDER BY tipo_cochinilla_id ASC`,
    [activo]
  )
}

export const obtenerTipoCochinillaPorIdRepo = async (id, t = db) => {
  return await t.oneOrNone(
    `SELECT *
     FROM lotes.tipo_cochinilla
     WHERE tipo_cochinilla_id = $1`,
    [id]
  )
}
