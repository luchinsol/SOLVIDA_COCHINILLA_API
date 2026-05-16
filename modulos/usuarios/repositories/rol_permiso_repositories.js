import db from '../../../config/database.js'

export const listarPermisosPorRolRepo = async (rolId) => {
  return await db.query(
    `SELECT
       rp.rol_id::int AS rol_id,
       r.nombre AS rol_nombre,
       rp.permiso_id::int AS permiso_id,
       p.codigo AS permiso_codigo
     FROM seguridad.rol_permiso rp
     INNER JOIN seguridad.rol r
       ON rp.rol_id = r.rol_id
     INNER JOIN seguridad.permiso p
       ON rp.permiso_id = p.permiso_id
     WHERE rp.rol_id = $1
     ORDER BY rp.permiso_id ASC`,
    [rolId]
  )
}
