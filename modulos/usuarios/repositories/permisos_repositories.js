import db from '../../../config/database.js'

export const listarPermisosRepo = async () => {
  return await db.query(
    `SELECT *
     FROM seguridad.permiso
     ORDER BY 1 ASC`
  )
}
