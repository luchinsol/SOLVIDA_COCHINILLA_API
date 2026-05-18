import db from '../../../config/database.js'

export const listarPermisosRepo = async () => {
  return await db.query(
    `SELECT
       permiso_id::int AS permiso_id,
       codigo,
       descripcion,
       modulo,
       recurso,
       accion,
       alcance
     FROM seguridad.permiso
     ORDER BY permiso_id ASC`
  )
}

export const crearPermisoRepo = async (permiso) => {
  return await db.one(
    `INSERT INTO seguridad.permiso
     (codigo, descripcion, modulo, recurso, accion, alcance)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING
       permiso_id::int AS permiso_id,
       codigo,
       descripcion,
       modulo,
       recurso,
       accion,
       alcance`,
    [
      permiso.codigo,
      permiso.descripcion ?? null,
      permiso.modulo,
      permiso.recurso,
      permiso.accion,
      permiso.alcance ?? null
    ]
  )
}
