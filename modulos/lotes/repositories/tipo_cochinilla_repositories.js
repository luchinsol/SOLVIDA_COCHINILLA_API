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
