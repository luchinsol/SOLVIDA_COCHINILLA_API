import db from '../../../config/database.js'

const selectRolPermisos = `
  SELECT
    rp.rol_id::int AS rol_id,
    r.nombre AS rol_nombre,
    rp.permiso_id::int AS permiso_id,
    p.codigo AS permiso_codigo
  FROM seguridad.rol_permiso rp
  INNER JOIN seguridad.rol r
    ON rp.rol_id = r.rol_id
  INNER JOIN seguridad.permiso p
    ON rp.permiso_id = p.permiso_id
`

export const listarPermisosPorRolRepo = async (rolId = null) => {
  if (rolId == null) {
    return await db.query(
      `${selectRolPermisos}
       ORDER BY rp.rol_id ASC, rp.permiso_id ASC`
    )
  }

  return await db.query(
    `${selectRolPermisos}
     WHERE rp.rol_id = $1
     ORDER BY rp.permiso_id ASC`,
    [rolId]
  )
}

export const tienePermisoPorRolRepo = async (rolId, permisoCodigo) => {
  return await db.oneOrNone(
    `SELECT 1
     FROM seguridad.rol_permiso rp
     INNER JOIN seguridad.permiso p
       ON rp.permiso_id = p.permiso_id
     WHERE rp.rol_id = $1
       AND p.codigo = $2`,
    [rolId, permisoCodigo]
  )
}

export const crearRolPermisoRepo = async (rolId, permisoId) => {
  await db.one(
    `INSERT INTO seguridad.rol_permiso
     (rol_id, permiso_id)
     VALUES ($1, $2)
     RETURNING rol_id, permiso_id`,
    [rolId, permisoId]
  )

  return await db.one(
    `${selectRolPermisos}
     WHERE rp.rol_id = $1
       AND rp.permiso_id = $2`,
    [rolId, permisoId]
  )
}
