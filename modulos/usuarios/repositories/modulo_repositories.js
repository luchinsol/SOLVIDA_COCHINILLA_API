import db from '../../../config/database.js'

export const listarModulosRepo = async () => {
  return await db.query(
    `SELECT
       modulo_id::int AS modulo_id,
       nombre
     FROM seguridad.modulo
     ORDER BY modulo_id ASC`
  )
}
