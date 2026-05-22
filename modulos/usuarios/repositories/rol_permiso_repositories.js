import db from '../../../config/database.js'

const selectRolPermisos = `
  SELECT
    rp.rol_id::int AS rol_id,
    r.nombre AS rol_nombre,
    rp.permiso_id::int AS permiso_id,
    p.codigo AS permiso_codigo,
    p.modulo_id::int AS modulo_id,
    m.nombre AS modulo_nombre,
    p.recurso,
    p.accion,
    p.alcance
  FROM seguridad.rol_permiso rp
  INNER JOIN seguridad.rol r
    ON rp.rol_id = r.rol_id
  INNER JOIN seguridad.permiso p
    ON rp.permiso_id = p.permiso_id
  LEFT JOIN seguridad.modulo m
    ON p.modulo_id = m.modulo_id
`

export const listarPermisosPorRolRepo = async ({ rolId = null, modulo = null } = {}) => {
  const conditions = []
  const values = []

  if (rolId != null) {
    values.push(rolId)
    conditions.push(`rp.rol_id = $${values.length}`)
  }

  if (modulo != null) {
    values.push(String(modulo).trim().toLowerCase())
    conditions.push(`LOWER(m.nombre) = $${values.length}`)
  }

  const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''

  return await db.query(
    `${selectRolPermisos}
     ${whereClause}
     ORDER BY rp.rol_id ASC, rp.permiso_id ASC`,
    values
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
