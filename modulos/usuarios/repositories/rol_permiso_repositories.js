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

const selectPermisos = `
  SELECT
    p.permiso_id::int AS permiso_id,
    p.codigo AS permiso_codigo,
    p.modulo_id::int AS modulo_id,
    m.nombre AS modulo_nombre,
    p.recurso,
    p.accion,
    p.alcance
  FROM seguridad.permiso p
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

export const obtenerPermisoPorIdRepo = async (permisoId) => {
  return await db.oneOrNone(
    `${selectPermisos}
     WHERE p.permiso_id = $1`,
    [permisoId]
  )
}

export const obtenerPermisoPorRecursoAccionAlcanceRepo = async ({ recurso, accion, alcance }) => {
  const values = [recurso, accion]
  const alcanceCondition =
    alcance === null || alcance === undefined || alcance === ''
      ? 'p.alcance IS NULL'
      : (() => {
          values.push(alcance)
          return `p.alcance = $${values.length}`
        })()

  return await db.oneOrNone(
    `${selectPermisos}
     WHERE p.recurso = $1
       AND p.accion = $2
       AND ${alcanceCondition}`,
    values
  )
}

export const obtenerPermisoPorCodigoRepo = async (codigo) => {
  return await db.oneOrNone(
    `${selectPermisos}
     WHERE p.codigo = $1`,
    [codigo]
  )
}

export const listarRolPermisosPorRecursoAccionRepo = async ({ rolId, recurso, accion }) => {
  return await db.query(
    `${selectRolPermisos}
     WHERE rp.rol_id = $1
       AND p.recurso = $2
       AND p.accion = $3
     ORDER BY rp.permiso_id ASC`,
    [rolId, recurso, accion]
  )
}

export const listarCatalogoPermisosRepo = async ({ modulo = null } = {}) => {
  const values = []
  const conditions = []

  if (modulo != null) {
    values.push(String(modulo).trim().toLowerCase())
    conditions.push(`LOWER(m.nombre) = $${values.length}`)
  }

  const whereClause = conditions.length ? ` WHERE ${conditions.join(' AND ')}` : ''

  return await db.query(
    `${selectPermisos}
     ${whereClause}
     ORDER BY p.modulo_id ASC, p.recurso ASC, p.accion ASC, p.permiso_id ASC`,
    values
  )
}

export const obtenerRolPorIdRepo = async (rolId) => {
  return await db.oneOrNone(
    `SELECT
       rol_id::int AS rol_id,
       nombre AS rol_nombre
     FROM seguridad.rol
     WHERE rol_id = $1`,
    [rolId]
  )
}

export const existeRolPermisoRepo = async (rolId, permisoId) => {
  return await db.oneOrNone(
    `SELECT 1
     FROM seguridad.rol_permiso
     WHERE rol_id = $1
       AND permiso_id = $2`,
    [rolId, permisoId]
  )
}

export const eliminarRolPermisoRepo = async (rolId, permisoId) => {
  const result = await db.result(
    `DELETE FROM seguridad.rol_permiso
     WHERE rol_id = $1
       AND permiso_id = $2`,
    [rolId, permisoId]
  )

  return result.rowCount > 0
}
